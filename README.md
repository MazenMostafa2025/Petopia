## Requirements Documentation

### API Routes

## Authentication API

### 1. Signup

**Endpoint:** `POST /api/v1/users/signup`  
**Description:** Creates a new user account.  
**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Status Code:** `201 Created`

### 2. Login

**Endpoint:** `POST /api/v1/users/login`  
**Description:** Logs in an existing user.  
**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Status Code:** `200 OK`

### 3. Upload Product Picture

**Endpoint:** `POST /api/v1/users/upload_product_picture`  
**Description:** Add user profile picture.  
**Request Body:**  
_Form-data:_

- profileImage

**Protected Routes Middleware:**

- `protect`: Middleware to protect routes by verifying JWT token.
- `restrictTo`: Middleware to restrict access based on user roles.

---

## Cart API

### 1. Get Cart Items

**Endpoint:** `GET /api/v1/cart/`  
**Description:** Retrieves items in the user's cart.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

### 2. Add Item to Cart

**Endpoint:** `POST /api/v1/cart/`  
**Description:** Adds a product to the user's cart.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Request Body:**

```json
{
  "product_id": "60983035efb47391c3b11846"
}
```

**Status Code:** `201 Created`

### 3. Update Item Quantity in Cart

**Endpoint:** `PUT /api/v1/cart/:itemId`  
**Description:** Update certain product quantity in cart.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Parameters:** itemId  
  **Request Body:**

```json
{
  "quantity": 5
}
```

**Status Code:** `200 OK`

### 4. Remove Product from Cart

**Endpoint:** `DELETE /api/v1/cart/:itemId`  
**Description:** Remove product from cart.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Parameters:** cartId  
  **Status Code:** `204 No Content`

### 5. Delete Whole Cart

**Endpoint:** `DELETE /api/v1/cart/`  
**Description:** To delete whole cart.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `204 No Content`

---

## Order API

### 1. Create Order

**Endpoint:** `POST /api/v1/order/`  
**Description:** Creates a new order.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `201 Created`

### 2. Get All Orders

**Endpoint:** `GET /api/v1/order`  
**Description:** Retrieves all orders placed by the current user.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

### 3. Get Delivered Orders

**Endpoint:** `GET /api/v1/order/delivered`  
**Description:** Retrieves all delivered orders placed by the current user.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

### 4. Get Undelivered Orders

**Endpoint:** `GET /api/v1/order/undelivered`  
**Description:** Retrieves all undelivered orders placed by the current user.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

### 5. Get Order Details by ID

**Endpoint:** `GET /api/v1/order/:id`  
**Description:** Retrieves details of a certain order of the user.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

### 6. Update Order Payment Status

**Endpoint:** `GET /api/v1/order/pay/:order_id`  
**Description:** Update certain order status to paid.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

### 7. Update Order Delivery Status

**Endpoint:** `GET /api/v1/order/deliver/:order_id`  
**Description:** Update certain order status to delivered.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

### 8. Get Order Dashboard

**Endpoint:** `GET /api/v1/order/dashboard`  
**Description:** Returns details from a certain start date to a certain end date.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Query parameters:** startDate, endDate  
  **Status Code:** `200 OK`

### 9. Get All Orders (Admin)

**Endpoint:** `GET /api/v1/order/all-orders`  
**Description:** Retrieve all orders details from all users.  
**Request Headers:**

- Authorization: Bearer JWT_TOKEN  
  **Status Code:** `200 OK`

---

## Product API

### 1. Get All Products

**Endpoint:** `GET /api/v1/products/`  
**Description:** Retrieves all products.  
**Request Query Parameters (Optional):**

- price[gte]: Filter products with a price greater than or equal to the specified value.
- price[lte]: Filter products with a price less than or equal to the specified value.
- sort: Sort products based on specified fields (e.g., price, createdAt).
- fields: Select specific fields to include in the response.
- page: Specify the page number for paginated results.
- limit: Specify the maximum number of products per page.  
  **Status Code:** `200 OK`

### 2. Get Product by ID

**Endpoint:** `GET /api/v1/products/:id`  
**Description:** Retrieve specific product data by ID.  
**Request Parameters:**

- id: Product ID  
  **Status Code:** `200 OK`

### 3. Add Product

**Endpoint:** `POST /api/v1/products`  
**Description:** Adds new product.  
**Request Body:**

```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 100,
  "gender": "female",
  "age": 2,
  "breed": "yes",
  "price": 3923
}
```

**Status Code:** `201 Created`

### 4. Upload Product Picture

**Endpoint:** `POST /api/v1/products/upload_product_picture`  
**Description:** Add product picture.  
**Request Parameters:** id: Product ID  
**Request Body:**  
_Form-data:_

- productImage  
  **Status Code:** `200 OK`

### 5. Update Product

**Endpoint:** `PUT /api/v1/products/:id`  
**Description:** Updates an existing product price or description.  
**Request Parameters:**

- id: Product ID  
  **Request Body:**

```json
{
  "description": "Updated Product Description",
  "price": 120
}
```

**Status Code:** `200 OK`

### 6. Delete Product

**Endpoint:** `DELETE/api/v1/products/:id`  
**Description:** Deletes an existing product from products list.  
**Request Parameters:**

- id: Product ID  
  **Status Code:** `204 No Content`

### 7. Search Products (with Elasticsearch & Redis Caching)

**Endpoint:** `GET /api/v1/products/search`  
**Description:** Full-text and advanced search for products using Elasticsearch, with Redis caching for fast repeated queries.
**Request Query Parameters (Optional):**

- `q`: Search term (required)
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `category`: Category filter
- `sort`: Sort results (e.g., `price:desc`)
- `size`: Number of results per page
- `from`: Pagination offset
  **Status Code:** `200 OK`
  **Notes:**
- Results are cached for 60 seconds in Redis for repeated queries.
- Search supports typo tolerance, field boosting, and highlighting of matched terms.

---

## Technology Integrations

- **Elasticsearch**: Used for advanced, typo-tolerant, and fast product search.
- **Redis**: Used for caching search results to improve performance and reduce load on Elasticsearch.
