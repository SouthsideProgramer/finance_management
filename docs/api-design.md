# Thiết kế API

Base URL: `http://localhost:3001/api`

## Auth

### POST /auth/register

**Request**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "password": "matkhau123"
}
```

**Response** `201`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com"
  }
}
```

### POST /auth/login

**Request**
```json
{
  "email": "nguyenvana@email.com",
  "password": "matkhau123"
}
```

**Response** `200`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com"
  }
}
```

## Users

### GET /users/me

**Headers**: `Authorization: Bearer <token>`

**Response** `200`
```json
{
  "id": "uuid",
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "avatarUrl": null,
  "theme": "light",
  "showBalanceDefault": false
}
```

### PUT /users/me

**Request**
```json
{
  "name": "Nguyễn Văn B",
  "theme": "dark",
  "showBalanceDefault": true
}
```

**Response** `200`
```json
{
  "id": "uuid",
  "name": "Nguyễn Văn B",
  "theme": "dark",
  "showBalanceDefault": true
}
```

## Transactions

### GET /transactions

**Query**: `?type=deposit&page=1&limit=20`

**Response** `200`
```json
{
  "data": [
    {
      "id": "TXN-0812",
      "date": "28/06/2026",
      "type": "deposit",
      "description": "Chuyển khoản định kỳ",
      "amount": 20000000,
      "quarter": "Q2-2026",
      "status": "completed"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}
```

### POST /transactions

**Request**
```json
{
  "type": "deposit",
  "amount": 20000000,
  "description": "Chuyển khoản định kỳ",
  "quarter": "Q2-2026"
}
```

**Response** `201`
```json
{
  "id": "TXN-0813",
  "type": "deposit",
  "amount": 20000000,
  "status": "completed",
  "createdAt": "2026-06-28T10:00:00Z"
}
```

## Chat

### POST /chat

**Request**
```json
{
  "message": "Làm sao để tiết kiệm 100 triệu trong 5 năm?",
  "conversationId": null
}
```

**Response** `200`
```json
{
  "conversationId": "uuid",
  "reply": {
    "role": "assistant",
    "content": "Để tích lũy 100 triệu trong 5 năm..."
  }
}
```

### GET /chat/:conversationId/history

**Response** `200`
```json
{
  "messages": [
    { "role": "user", "content": "Làm sao để tiết kiệm..." },
    { "role": "assistant", "content": "Để tích lũy 100 triệu..." }
  ]
}
```
