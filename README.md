# pollutedCity
BookinGuru Task

npm i
npm run dev


How do I determine whether something is a city?

Keyword Filtering
    Reject if the name contains terms that usually indicate non-city locations, such as:
        "station", "district", "zone", "area", "unknown", "powerplant", "industrial", "monitoring".
    Matching is done case-insensitively.
    Bracket Words Removal : If the name has extra descriptors like (Area) or (Zone), strip them before saving.
    Name Validation
    Must be at least 2 characters after cleaning.
    Only letters, spaces, hyphens, and apostrophes allowed.
    Reject if it’s just numbers or special characters.
    Deduplication
    Keep only the first unique city name (case-insensitive).