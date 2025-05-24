select
    *,
    6371 * 2 *
    atan2(
        sqrt(
        sin((lat - $lat) * pi() / 180 / 2) * sin((lat - $lat) * pi() / 180 / 2) +
        cos($lat * pi() / 180) * cos(lat * pi() / 180) *
        sin((long - $long) * pi() / 180 / 2) * sin((long - $long) * pi() / 180 / 2)
        ),
        sqrt(
        1 - (
            sin((lat - $lat) * pi() / 180 / 2) * sin((lat - $lat) * pi() / 180 / 2) +
            cos($lat * pi() / 180) * cos(lat * pi() / 180) *
            sin((long - $long) * pi() / 180 / 2) * sin((long - $long) * pi() / 180 / 2)
        )
        )
    ) as distanceKm
from locations;
