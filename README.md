# Atlas Delivery Services — Full Stack App

## 🚀 What Changed (v2)

### ✅ Login System
- **/login** page with premium UI
- **Admin credentials:** configured only in backend environment variables
- Customers register with their own mobile number, email OTP and password.
- Admin login → redirects to `/admin` dashboard
- User login → redirects to home page
- Admin panel is route-protected (users who aren't admin get redirected)

### ✅ Admin-Only Product Management
- The **Admin** link in navbar only appears when logged in as admin
- `/admin` route redirects to `/login` if not logged in, to `/` if not admin
- Users browsing `/products` have **no add/edit/delete** option — view only

### ✅ Initial Products Seeded (36 products, 9 sectors)
- Backend `DataSeeder.java` seeds 4 products per sector on first run
- Agriculture, Aquaculture, Electrical, Electronics, Mechanical, Civil, Chemical, Food, Nano/Bio

### ✅ Premium Design
- Gradient navbar, hero with truck illustration, sector cards, why-us section
- Mobile-responsive everywhere (hamburger menu slides in from right)
- Premium login card with decorative background

### ✅ Mobile Responsive
- All pages tested for 380px–1400px
- Sidebar drawer navigation on mobile
- Product grids collapse to 1-2 columns on small screens

---

## 🏃 Running Locally

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### Vercel + Render

Set this environment variable in the Vercel project, then redeploy the frontend:

```text
REACT_APP_API_URL=https://your-render-service.onrender.com
```

This project uses Create React App, so browser environment variables must start
with `REACT_APP_`. Do not use `NEXT_PUBLIC_API_URL` for this frontend. The
frontend adds `/api/products` to the Render service URL automatically.

### Customer registration and email OTP

Add these secret environment variables to the Render backend service:

```text
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_APP_PASSWORD=your-google-app-password
MAIL_FROM=your-email@gmail.com
OTP_EXPIRY_MINUTES=10
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=use-a-long-random-password
ADMIN_NAME=Atlas Admin
JWT_SECRET=use-at-least-32-random-characters
JWT_EXPIRY_HOURS=24
```

For Gmail, enable two-step verification and create a Google App Password.
Never commit the app password to Git. Hibernate automatically creates the
`app_users`, `email_otps`, and `customer_orders` tables.

The customer flow includes email-OTP registration, login, forgot password,
cart, delivery-address checkout, order storage, and stock reduction. Checkout
supports Cash on Delivery and UPI on Delivery. Raw card numbers, CVVs, UPI
PINs, and banking passwords are intentionally not collected; prepaid payments
must use a PCI-compliant gateway such as Razorpay or Stripe.

All login roles are authenticated by the backend:

- Admin credentials come only from backend environment variables.
- Customers and sellers are stored in MySQL with BCrypt password hashes.
- Seller approval and rejection are stored in MySQL.
- Successful login returns a signed JWT used for protected API requests.
- Admin and seller product changes require authentication.
- Sellers can update or delete only products belonging to their own account.

For local development, create `backend/.env` using `backend/.env.example`.
The `.env` file is ignored by Git. On Render, enter the same values in the
service Environment settings instead of uploading the file.

### Database
Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/atlas_db
spring.datasource.username=root
spring.datasource.password=yourpassword
```

---

## 🐳 Docker (EC2 Deployment)
Same as before — use your existing `docker-compose.yml`.
The frontend build folder goes to nginx; backend JAR to the Spring Boot container.

---

## 🔐 Credentials Summary
| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | `ADMIN_EMAIL` | `ADMIN_PASSWORD` |
| Customer | Register with email OTP | Your password |

*Auth is frontend-only (localStorage). For production, wire to a real JWT backend.*
