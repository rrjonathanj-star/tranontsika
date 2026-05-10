# Get user's own properties (Protected)
GET /api/properties/my-properties

Request Headers:
- Authorization: Bearer {accessToken}

Response:
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Beautiful Apartment",
      "description": "...",
      "type": "apartment",
      "city": "Antananarivo",
      "address": "123 Main Street",
      "price_per_month": 500,
      "bedrooms": 2,
      "bathrooms": 1,
      "area": 100,
      "amenities": ["wifi", "kitchen", "parking"],
      "status": "available",
      "owner_id": 1,
      "created_at": "2026-05-10T10:00:00Z",
      "updated_at": "2026-05-10T10:00:00Z"
    }
  ]
}
```
