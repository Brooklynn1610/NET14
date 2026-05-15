# Smart Home Devices API — Node + Express + MongoDB

This project is a custom REST API that manages Smart Home Devices. It supports full CRUD operations using Node.js, Express, and MongoDB.

## Custom Data Model (Device)
* **`name`** (String) - The name of the device (e.g., "Smart Thermostat").
* **`room`** (String) - The location of the device (e.g., "Living Room").
* **`status`** (String) - The current state of the device (e.g., "On", "Off").
* **`battery`** (Number) - The battery percentage remaining (0-100).

## API Route Demonstrations
*(Postman screenshots demonstrating the functionality of all API routes)*

<img width="1214" height="587" alt="Screenshot 2026-05-14 at 3 31 20 PM" src="https://github.com/user-attachments/assets/a346cac0-4b61-403a-9b92-a6e1522a0081" />

---

## Exercise Questions & Answers

**1. What is the purpose of using `.env`?**

The `.env` file is used to store environment variables safely. It keeps sensitive information (like database connection strings and port numbers) out of your main source code, preventing sensitive data from being accidentally committed to version control like GitHub.

**2. How does this work?**
```js
if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
}
```

**Answer:** Builds a MongoDB query to filter results based on a numerical range. 
* It first checks if the user provided either a `minPrice` or `maxPrice` parameter in the URL.
* If so, it creates an empty `price` object within the query `filter`.
* If `minPrice` is provided, it uses the MongoDB operator **`$gte`** (greater than or equal to) to grab documents where the price is at or above that number.
* If `maxPrice` is provided, it uses the **`$lte`** (less than or equal to) operator to grab documents where the price is at or below that number.
* The `Number()` function safely converts the URL query parameters (which are strings by default) into numbers so the database can accurately compare them.

**3. What is the program `seed.js` used for?**
A seed file is used to initially populate the database with test or dummy data. Running `seed.js` instantly drops sample documents into the database collection so you can immediately start testing the API routes without having to manually add items one by one.

**4. Try all API routes using Postman.**

<img width="1092" height="764" alt="Screenshot 2026-05-14 at 4 01 41 PM" src="https://github.com/user-attachments/assets/88fe5f92-92c8-4a2d-b40c-b512bc8e552d" />
<img width="1440" height="900" alt="Screenshot 2026-05-14 at 4 18 45 PM" src="https://github.com/user-attachments/assets/85e431f2-edae-4cfa-a8d1-c123dcd66be0" />
<img width="1440" height="900" alt="Screenshot 2026-05-14 at 4 10 46 PM" src="https://github.com/user-attachments/assets/1d5843ef-fcec-421c-9819-aaf2919c69ee" />
<img width="1440" height="900" alt="Screenshot 2026-05-14 at 4 19 33 PM" src="https://github.com/user-attachments/assets/f85ef64b-b046-4507-b431-b24972350e67" />
<img width="1440" height="900" alt="Screenshot 2026-05-14 at 4 06 30 PM" src="https://github.com/user-attachments/assets/c692284d-9b3f-4778-b5fd-035b8265a5c3" />


**5. In terms of code, what is the difference between PUT and PATCH?**
* **PUT** is used to completely replace an existing resource. You generally need to send the entire object payload in the request body. If fields are omitted, they may be overwritten as null or removed entirely.
* **PATCH** is used to partially update an existing resource. You only need to send the specific fields you want to change, and the rest of the document's data remains untouched in the database.
