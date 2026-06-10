# Atlas Delivery Services — Full Stack App

## 🚀 What Changed (v2)

### ✅ Login System
- **/login** page with premium UI
- **Admin credentials:** `admin@atlas.com` / `admin123`
- **User credentials:** `user@atlas.com` / `user123`
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
| Admin | admin@atlas.com    | admin123  |
| User  | user@atlas.com     | user123   |

*Auth is frontend-only (localStorage). For production, wire to a real JWT backend.*
