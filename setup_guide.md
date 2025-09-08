# Booking System Setup Guide

## Files Structure
```
your-project/
├── index.html (existing)
├── product.html (existing)
├── menu.js (existing)
├── store.json (existing)
├── booking.html (new - the main booking calendar)
├── booking-config.js (new - configuration)
├── google-calendar-integration.js (new - Google Calendar API)
├── booking-data-manager.js (new - data management)
└── README.md (this file)
```

## Step 1: Copy the Files

1. Save the main booking system as `booking.html`
2. Extract the JavaScript files from the integration code and save them separately
3. Add a booking button to your existing `index.html`

## Step 2: Modify Your store.json

Add booking services to your `store.json`:

```json
{
  "header": [
    {
      "storeName": "IsBeautiful Web Store",
      "address": "Ahmedabad, Gujarat",
      "contact": 917043830947,
      "whatsappNumber": 9184017055509,
      "upiId": "mscandoursconsumerprivatelimited.eazypay@icici",
      "email": "info@isbeautifulindia.com",
      "website": "https://isbeautifulindia.com/",
      "operatingHours": "7:00 AM - 11:00 PM",
      "description": "Insurance for your skins",
      "googleCalendarEmail": "your-business@gmail.com"
    }
  ],
  "items": [
    // Your existing products...
    {
      "name": "Haircut & Styling Service",
      "description": "Professional haircut and styling service",
      "price": 1200,
      "category": "Booking Services",
      "subcategory": "Salon",
      "booking_type": "salon",
      "service_duration": 60,
      "onsale": "true",
      "rating": 4.8,
      "offer": 10,
      "starttime": 9,
      "endtime": 19,
      "image-1": "https://images.teyzee.site/services/haircut.jpg"
    },
    {
      "name": "Deluxe Hotel Room",
      "description": "Comfortable deluxe room with modern amenities",
      "price": 3500,
      "category": "Booking Services",
      "subcategory": "Hotel",
      "booking_type": "hotel",
      "room_capacity": 3,
      "onsale": "true",
      "rating": 4.7,
      "offer": 15,
      "starttime": 0,
      "endtime": 24,
      "image-1": "https://images.teyzee.site/services/deluxe-room.jpg"
    }
  ]
}
```

## Step 3: Add Booking Button to index.html

Add this button to your footer section in `index.html`:

```html
<!-- Add this inside your .footer-container div -->
<button class="footer-btn" onclick="window.location.href='booking.html'" aria-label="Book Appointment">
    <i class="fas fa-calendar"></i> Book Now
</button>
```

## Step 4: Google Calendar Setup

### 4.1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create credentials (API key and OAuth client ID)

### 4.2: Configure Calendar
1. Create separate Google Calendars for salon and hotel bookings
2. Get the Calendar IDs from calendar settings
3. Update `booking-config.js` with your credentials:

```javascript
const BOOKING_CONFIG = {
    GOOGLE_CALENDAR: {
        API_KEY: 'your-actual-api-key',
        CLIENT_ID: 'your-actual-client-id.apps.googleusercontent.com',
        SALON_CALENDAR_ID: 'salon@your-business.com',
        HOTEL_CALENDAR_ID: 'hotel@your-business.com'
    }
    // ... rest of config
};
```

## Step 5: Customize Services

Edit the services in `booking-config.js` to match your business:

```javascript
SERVICES: {
    salon: [
        { id: 1, name: 'IsBeautiful Facial', duration: 90, price: 1800, category: 'Skin' },
        { id: 2, name: 'Hair Treatment', duration: 120, price: 2200, category: 'Hair' },
        // Add your actual services...
    ],
    hotel: [
        { id: 1, name: 'Standard Room', price: 2000, capacity: 2 },
        { id: 2, name: 'Premium Suite', price: 4500, capacity: 4 },
        // Add your actual rooms...
    ]
}
```

## Step 6: Test the System

1. Open `booking.html` in your browser
2. Test both salon and hotel booking flows
3. Verify WhatsApp integration works with your number
4. Test Google Calendar integration (requires HTTPS for OAuth)

## Step 7: Deploy

### For Production:
1. Upload all files to your web server
2. Ensure HTTPS is enabled (required for Google Calendar OAuth)
3. Update domain in Google Cloud Console OAuth settings
4. Test all functionality on live server

## Step 8: Integration with Your Existing Cart System

### Modify your existing menu.js:

Add booking service detection to your existing `selectDish` function:

```javascript
function selectDish(dishName, buttonElement) {
    // Check if this is a booking service
    const dishData = getDishData(dishName);
    if (dishData && dishData.booking_type) {
        // Redirect to booking page with service pre-selected
        const bookingType = dishData.booking_type;
        const serviceId = dishData.service_id;
        window.location.href = `booking.html?type=${bookingType}&service=${serviceId}`;
        return;
    }
    
    // Original cart logic
    if (!selectedDishes[dishName]) {
        selectedDishes[dishName] = 1;
        toggleCounter(buttonElement, dishName);
    }
    updateCartUI();
}

function getDishData(dishName) {
    const items = storeData.items || [];
    return items.find(item => `${item.name} - ₹${item.price}` === dishName);
}
```

### Update your store.json with booking services:

```json
{
  "items": [
    // Existing products...
    {
      "name": "Professional Haircut & Style",
      "description": "Expert haircut and styling service by certified professionals",
      "price": 1200,
      "dyn_inv": 999,
      "category": "Salon Services",
      "subcategory": "Hair Care",
      "booking_type": "salon",
      "service_id": 1,
      "service_duration": 60,
      "onsale": "true",
      "rating": 4.8,
      "offer": 10,
      "starttime": 9,
      "endtime": 19,
      "add_text": "Duration: 60 minutes. Includes consultation, cut, wash, and style.",
      "image-1": "https://images.teyzee.site/services/haircut.jpg",
      "image-2": "https://images.teyzee.site/services/haircut2.jpg",
      "image-3": "https://images.teyzee.site/services/haircut3.jpg"
    },
    {
      "name": "IsBeautiful Signature Facial",
      "description": "Rejuvenating facial treatment using IsBeautiful products",
      "price": 1800,
      "dyn_inv": 999,
      "category": "Salon Services",
      "subcategory": "Skin Care",
      "booking_type": "salon",
      "service_id": 3,
      "service_duration": 90,
      "onsale": "true",
      "rating": 4.9,
      "offer": 15,
      "starttime": 9,
      "endtime": 19,
      "add_text": "Duration: 90 minutes. Uses premium IsBeautiful skincare products.",
      "image-1": "https://images.teyzee.site/services/facial.jpg"
    },
    {
      "name": "Luxury Hotel Suite",
      "description": "Premium accommodation with stunning views and modern amenities",
      "price": 5000,
      "dyn_inv": 5,
      "category": "Hotel Services",
      "subcategory": "Accommodation",
      "booking_type": "hotel",
      "service_id": 3,
      "room_capacity": 4,
      "onsale": "true",
      "rating": 4.7,
      "offer": 20,
      "starttime": 0,
      "endtime": 24,
      "add_text": "Per night rate. Sleeps 4 guests. Includes WiFi, AC, TV, Mini Bar, Balcony.",
      "image-1": "https://images.teyzee.site/services/suite.jpg"
    }
  ]
}
```

## Step 9: Advanced Features

### 9.1: URL Parameters Support
Update booking.html to support pre-selection via URL:

```javascript
// Add to booking.html script section
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingType = urlParams.get('type');
    const serviceId = urlParams.get('service');
    
    if (bookingType) {
        switchBookingType(bookingType);
        
        if (serviceId) {
            // Pre-select the service
            const service = serviceData[bookingType].find(s => s.id == serviceId);
            if (service) {
                setTimeout(() => selectService(service), 500);
            }
        }
    }
    
    loadStoreData();
    generateCalendar();
    populateServices();
});
```

### 9.2: Admin Dashboard (Optional)
Create `admin.html` for managing bookings:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Booking Admin Dashboard</title>
    <style>
        /* Simple admin styles */
        body { font-family: Arial, sans-serif; margin: 20px; }
        .booking-item { border: 1px solid #ccc; margin: 10px 0; padding: 15px; }
        .status-pending { border-left: 4px solid #ffc107; }
        .status-confirmed { border-left: 4px solid #28a745; }
        .status-cancelled { border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <h1>Booking Management</h1>
    <div id="bookings-list"></div>
    
    <script src="booking-data-manager.js"></script>
    <script>
        const manager = new BookingDataManager();
        const bookings = manager.getAllBookings();
        
        const listContainer = document.getElementById('bookings-list');
        bookings.forEach(booking => {
            const div = document.createElement('div');
            div.className = `booking-item status-${booking.status}`;
            div.innerHTML = `
                <h3>${booking.customerName} - ${booking.service.name}</h3>
                <p>Status: ${booking.status}</p>
                <p>Contact: ${booking.customerPhone}</p>
                <p>Date: ${new Date(booking.createdAt).toLocaleString()}</p>
                <button onclick="manager.updateBookingStatus('${booking.id}', 'confirmed')">Confirm</button>
                <button onclick="manager.updateBookingStatus('${booking.id}', 'cancelled')">Cancel</button>
            `;
            listContainer.appendChild(div);
        });
    </script>
</body>
</html>
```

## Step 10: Testing Checklist

- [ ] Booking form loads correctly
- [ ] Calendar navigation works
- [ ] Service selection functions
- [ ] Time slot selection works (salon)
- [ ] Date range selection works (hotel)
- [ ] Form validation works
- [ ] WhatsApp message format is correct
- [ ] Google Calendar integration works
- [ ] Mobile responsiveness
- [ ] Integration with existing store works

## Step 11: Troubleshooting

### Common Issues:

1. **Google Calendar not working**: Ensure HTTPS and correct OAuth settings
2. **WhatsApp not opening**: Check phone number format (include country code)
3. **Calendar not displaying**: Check browser console for JavaScript errors
4. **Services not loading**: Verify `booking-config.js` is loaded correctly

### Console Commands for Testing:

```javascript
// Test booking manager
const testBooking = {
    type: 'salon',
    service: { name: 'Test Service', price: 1000 },
    customerName: 'Test User',
    customerPhone: '1234567890',
    customerEmail: 'test@example.com'
};
bookingManager.saveBooking(testBooking);

// Test Google Calendar
googleCalendar.init().then(() => console.log('Google Calendar ready'));
```

## Step 12: Production Considerations

1. **Database Integration**: Replace localStorage with actual database
2. **Payment Integration**: Add payment gateway for bookings
3. **Email Notifications**: Send confirmation emails
4. **SMS Integration**: Send SMS confirmations
5. **Analytics**: Track booking conversion rates
6. **Backup System**: Regular backup of booking data

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all file paths are correct
3. Ensure Google Calendar API credentials are set up properly
4. Test WhatsApp number format
5. Check HTTPS configuration for production

The system is designed to integrate seamlessly with your existing store while adding powerful booking capabilities for both salon appointments and hotel reservations.