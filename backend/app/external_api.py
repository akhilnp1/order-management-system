import logging
import httpx
from app.config import settings

logger = logging.getLogger("app.external_api")


async def convert_to_usd(amount: float, from_currency: str = "INR") -> float | None:
    """
    Converts a given amount into USD using the Frankfurter public exchange rate API.
    Fails gracefully by returning None if the external API is unavailable.
    """
    if from_currency.upper() == "USD":
        return round(amount, 2)

    params = {"amount": amount, "from": from_currency, "to": "USD"}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(settings.external_api_url, params=params)
            response.raise_for_status()
            data = response.json()
            usd_amount = data.get("rates", {}).get("USD")
            if usd_amount is None:
                return None
            return round(float(usd_amount), 2)
    except (httpx.HTTPError, httpx.TimeoutException, ValueError) as exc:
        logger.warning("External currency API call failed: %s", exc)
        return None
