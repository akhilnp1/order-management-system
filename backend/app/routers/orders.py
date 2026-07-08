import logging
import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database import get_db
from app.models import Order, OrderStatus
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate, OrderListResponse, ApiResponse
from app.auth import get_current_user
from app.external_api import convert_to_usd
from app.websocket_manager import manager

logger = logging.getLogger("app.orders")
router = APIRouter(prefix="/api/orders", tags=["Orders"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreate, db: AsyncSession = Depends(get_db)):
    usd_amount = await convert_to_usd(payload.amount, from_currency="INR")

    order = Order(
        customer_name=payload.customer_name,
        amount=payload.amount,
        status=payload.status,
        amount_usd=usd_amount,
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)

    order_out = OrderOut.model_validate(order)
    logger.info("Order %d created for customer '%s'", order.id, order.customer_name)

    await manager.broadcast({
        "event": "order_created",
        "order": order_out.model_dump(),
    })

    return ApiResponse(success=True, message="Order created successfully", data=order_out.model_dump())


@router.get("", response_model=OrderListResponse)
async def list_orders(
    db: AsyncSession = Depends(get_db),
    status_filter: Optional[OrderStatus] = Query(default=None, alias="status"),
    search: Optional[str] = Query(default=None, description="Search by customer name"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
):
    query = select(Order)
    count_query = select(func.count()).select_from(Order)

    if status_filter:
        query = query.where(Order.status == status_filter)
        count_query = count_query.where(Order.status == status_filter)

    if search:
        pattern = f"%{search}%"
        query = query.where(or_(Order.customer_name.ilike(pattern)))
        count_query = count_query.where(or_(Order.customer_name.ilike(pattern)))

    total = (await db.execute(count_query)).scalar_one()

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    orders = result.scalars().all()

    return OrderListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=[OrderOut.model_validate(o) for o in orders],
    )


@router.get("/summary")
async def order_summary(db: AsyncSession = Depends(get_db)):
    total_result = await db.execute(select(func.count()).select_from(Order))
    total_orders = total_result.scalar_one()

    status_result = await db.execute(
        select(Order.status, func.count()).group_by(Order.status)
    )
    status_counts = {status.value: 0 for status in OrderStatus}
    for status_value, count in status_result.all():
        status_counts[status_value.value] = count

    return {
        "total_orders": total_orders,
        "status_summary": status_counts,
    }


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order {order_id} not found")
    return OrderOut.model_validate(order)


@router.patch("/{order_id}/status", response_model=ApiResponse)
async def update_order_status(order_id: int, payload: OrderStatusUpdate, db: AsyncSession = Depends(get_db)):
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Order {order_id} not found")

    previous_status = order.status
    order.status = payload.status
    await db.commit()
    await db.refresh(order)

    order_out = OrderOut.model_validate(order)
    logger.info("Order %d status changed: %s -> %s", order_id, previous_status.value, order.status.value)

    await manager.broadcast({
        "event": "order_status_updated",
        "order": order_out.model_dump(),
        "previous_status": previous_status.value,
    })

    return ApiResponse(success=True, message="Order status updated", data=order_out.model_dump())
