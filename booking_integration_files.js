// booking-config.js - Configuration file for booking system

const BOOKING_CONFIG = {
    // Google Calendar API Configuration
    GOOGLE_CALENDAR: {
        // You'll need to set up Google Calendar API credentials
        API_KEY: 'your-google-calendar-api-key',
        CLIENT_ID: 'your-google-client-id',
        // Calendar IDs for different booking types
        SALON_CALENDAR_ID: 'your-salon-calendar@gmail.com',
        HOTEL_CALENDAR_ID: 'your-hotel-calendar@gmail.com'
    },
    
    // Business hours and availability
    BUSINESS_HOURS: {
        salon: {
            start: 9,   // 9 AM
            end: 19,    // 7 PM
            closedDays: [0], // Sunday closed (0 = Sunday, 6 = Saturday)
            timeSlots: [
                '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
                '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
            ]
        },
        hotel: {
            checkInTime: 14,  // 2 PM
            checkOutTime: 11, // 11 AM
            maxAdvanceBooking: 90 // days
        }
    },
    
    // Booking services - you can modify these based on your business
    SERVICES: {
        salon: [
            { id: 1, name: 'Haircut & Style', duration: 60, price: 1200, category: 'Hair' },
            { id: 2, name: 'Hair Color', duration: 120, price: 2500, category: 'Hair' },
            { id: 3, name: 'Facial Treatment', duration: 90, price: 1800, category: 'Skin' },
            { id: 4, name: 'Manicure', duration: 45, price: 800, category: 'Nails' },
            { id: 5, name: 'Pedicure', duration: 60, price: 1000, category: 'Nails' },
            { id: 6, name: 'Hair Spa', duration: 90, price: 1500, category: 'Hair' },
            { id: 7, name: 'Eyebrow Threading', duration: 30, price: 300, category: 'Skin' },
            { id: 8, name: 'Full Body Massage', duration: 120, price: 3000, category: 'Body' }
        ],
        hotel: [
            { id: 1, name: 'Standard Room', price: 2500, capacity: 2, amenities: ['WiFi', 'AC', 'TV'] },
            { id: 2, name: 'Deluxe Room', price: 3500, capacity: 3, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'] },
            { id: 3, name: 'Suite', price: 5000, capacity: 4, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony'] },
            { id: 4, name: 'Family Room', price: 4000, capacity: 6, amenities: ['WiFi', 'AC', 'TV', 'Kitchen'] },
            { id: 5, name: 'Presidential Suite', price: 8000, capacity: 4, amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi'] }
        ]
    }
};

// google-calendar-integration.js - Google Calendar API integration

class GoogleCalendarIntegration {
    constructor() {
        this.isLoaded = false;
        this.isSignedIn = false;
    }

    // Initialize Google API
    async init() {
        try {
            // Load Google API
            await this.loadGoogleAPI();
            
            // Initialize the API
            await gapi.load('client:auth2', async () => {
                await gapi.client.init({
                    apiKey: BOOKING_CONFIG.GOOGLE_CALENDAR.API_KEY,
                    clientId: BOOKING_CONFIG.GOOGLE_CALENDAR.CLIENT_ID,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    scope: 'https://www.googleapis.com/auth/calendar'
                });

                this.authInstance = gapi.auth2.getAuthInstance();
                this.isSignedIn = this.authInstance.isSignedIn.get();
                this.isLoaded = true;
            });
        } catch (error) {
            console.error('Error initializing Google Calendar API:', error);
        }
    }

    // Load Google API script
    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            if (window.gapi) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Sign in to Google
    async signIn() {
        if (!this.isLoaded) {
            await this.init();
        }

        try {
            await this.authInstance.signIn();
            this.isSignedIn = true;
            return true;
        } catch (error) {
            console.error('Error signing in to Google:', error);
            return false;
        }
    }

    // Create calendar event
    async createEvent(bookingData) {
        if (!this.isSignedIn) {
            const signedIn = await this.signIn();
            if (!signedIn) {
                throw new Error('Failed to sign in to Google Calendar');
            }
        }

        const calendarId = bookingData.type === 'salon' 
            ? BOOKING_CONFIG.GOOGLE_CALENDAR.SALON_CALENDAR_ID 
            : BOOKING_CONFIG.GOOGLE_CALENDAR.HOTEL_CALENDAR_ID;

        const event = this.formatEventData(bookingData);

        try {
            const response = await gapi.client.calendar.events.insert({
                'calendarId': calendarId,
                'resource': event
            });

            console.log('Event created:', response);
            return response.result;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }

    // Format booking data for Google Calendar
    formatEventData(bookingData) {
        let event = {
            'summary': this.getEventTitle(bookingData),
            'description': this.getEventDescription(bookingData),
            'attendees': [
                {'email': bookingData.customerEmail}
            ],
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60}, // 24 hours before
                    {'method': 'popup', 'minutes': 60}       // 1 hour before
                ]
            }
        };

        if (bookingData.type === 'salon') {
            const startDateTime = new Date(bookingData.date);
            const [hours, minutes] = bookingData.time.split(':').map(Number);
            startDateTime.setHours(hours, minutes, 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + bookingData.service.duration);

            event.start = {
                'dateTime': startDateTime.toISOString(),
                'timeZone': 'Asia/Kolkata'
            };
            event.end = {
                'dateTime': endDateTime.toISOString(),
                'timeZone': 'Asia/Kolkata'
            };
        } else {
            // Hotel booking - all day event
            event.start = {
                'date': new Date(bookingData.checkInDate).toISOString().split('T')[0]
            };
            event.end = {
                'date': new Date(bookingData.checkOutDate).toISOString().split('T')[0]
            };
        }

        return event;
    }

    // Get event title
    getEventTitle(bookingData) {
        if (bookingData.type === 'salon') {
            return `${bookingData.service.name} - ${bookingData.customerName}`;
        } else {
            return `Hotel Booking - ${bookingData.service.name} - ${bookingData.customerName}`;
        }
    }

    // Get event description
    getEventDescription(bookingData) {
        let description = `Customer: ${bookingData.customerName}\n`;
        description += `Phone: ${bookingData.customerPhone}\n`;
        description += `Email: ${bookingData.customerEmail}\n\n`;

        if (bookingData.type === 'salon') {
            description += `Service: ${bookingData.service.name}\n`;
            description += `Duration: ${bookingData.service.duration} minutes\n`;
            description += `Price: ₹${bookingData.service.price}\n`;
        } else {
            description += `Room: ${bookingData.service.name}\n`;
            description += `Guests: ${bookingData.guests}\n`;
            description += `Nights: ${bookingData.nights}\n`;
            description += `Total: ₹${bookingData.totalPrice}\n`;
        }

        if (bookingData.specialRequests) {
            description += `\nSpecial Requests:\n${bookingData.specialRequests}`;
        }

        return description;
    }
}

// booking-data-manager.js - Local storage and data management

class BookingDataManager {
    constructor() {
        this.storageKey = 'teyzee_bookings';
    }

    // Save booking to storage
    saveBooking(bookingData) {
        try {
            const bookings = this.getAllBookings();
            const bookingId = this.generateBookingId();
            
            const booking = {
                id: bookingId,
                ...bookingData,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            bookings.push(booking);
            this.saveToStorage(bookings);
            
            return bookingId;
        } catch (error) {
            console.error('Error saving booking:', error);
            return null;
        }
    }

    // Get all bookings
    getAllBookings() {
        try {
            const bookings = this.getFromStorage();
            return Array.isArray(bookings) ? bookings : [];
        } catch (error) {
            console.error('Error getting bookings:', error);
            return [];
        }
    }

    // Get booking by ID
    getBooking(bookingId) {
        const bookings = this.getAllBookings();
        return bookings.find(booking => booking.id === bookingId);
    }

    // Update booking status
    updateBookingStatus(bookingId, status) {
        try {
            const bookings = this.getAllBookings();
            const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
            
            if (bookingIndex !== -1) {
                bookings[bookingIndex].status = status;
                bookings[bookingIndex].updatedAt = new Date().toISOString();
                this.saveToStorage(bookings);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error updating booking status:', error);
            return false;
        }
    }

    // Check availability for salon appointment
    isTimeSlotAvailable(date, time, duration) {
        const bookings = this.getAllBookings();
        const appointmentDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);

        const appointmentEnd = new Date(appointmentDate);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);

        return !bookings.some(booking => {
            if (booking.type !== 'salon' || booking.status === 'cancelled') {
                return false;
            }

            const bookingStart = new Date(booking.date);
            const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number);
            bookingStart.setHours(bookingHours, bookingMinutes, 0, 0);

            const bookingEnd = new Date(bookingStart);
            bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.service.duration);

            // Check for time overlap
            return (appointmentDate < bookingEnd && appointmentEnd > bookingStart);
        });
    }

    // Check room availability for hotel booking
    isRoomAvailable(checkInDate, checkOutDate, roomId) {
        const bookings = this.getAllBookings();
        
        return !bookings.some(booking => {
            if (booking.type !== 'hotel' || 
                booking.service.id !== roomId || 
                booking.status === 'cancelled') {
                return false;
            }

            const bookingCheckIn = new Date(booking.checkInDate);
            const bookingCheckOut = new Date(booking.checkOutDate);
            const requestCheckIn = new Date(checkInDate);
            const requestCheckOut = new Date(checkOutDate);

            // Check for date overlap
            return (requestCheckIn < bookingCheckOut && requestCheckOut > bookingCheckIn);
        });
    }

    // Generate unique booking ID
    generateBookingId() {
        return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Save to storage (in production, this would be a database)
    saveToStorage(data) {
        // Using a simple object storage since localStorage is not available
        if (!window.bookingsStorage) {
            window.bookingsStorage = {};
        }
        window.bookingsStorage[this.storageKey] = JSON.stringify(data);
    }

    // Get from storage
    getFromStorage() {
        if (!window.bookingsStorage || !window.bookingsStorage[this.storageKey]) {
            return [];
        }
        return JSON.parse(window.bookingsStorage[this.storageKey]);
    }

    // Export bookings (for admin use)
    exportBookings() {
        const bookings = this.getAllBookings();
        const dataStr = JSON.stringify(bookings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bookings_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// modified-index.js - Integration with existing index.html

// Add this to your existing index.html file or create a new booking section
function addBookingIntegration() {
    // Add booking button to existing footer
    const footerContainer = document.querySelector('.footer-container');
    if (footerContainer) {
        const bookingBtn = document.createElement('button');
        bookingBtn.className = 'footer-btn';
        bookingBtn.onclick = () => window.location.href = 'booking.html';
        bookingBtn.innerHTML = '<i class="fas fa-calendar"></i> Book Appointment';
        
        footerContainer.insertBefore(bookingBtn, footerContainer.firstChild);
    }

    // Add booking services to store.json structure
    const bookingServices = {
        salon: BOOKING_CONFIG.SERVICES.salon.map(service => ({
            name: service.name,
            description: `Professional ${service.category.toLowerCase()} service`,
            price: service.price,
            category: "Booking Services",
            subcategory: "Salon",
            onsale: true,
            rating: 4.8,
            offer: 10,
            starttime: BOOKING_CONFIG.BUSINESS_HOURS.salon.start,
            endtime: BOOKING_CONFIG.BUSINESS_HOURS.salon.end,
            add_text: `Duration: ${service.duration} minutes`,
            "image-1": "https://images.teyzee.site/booking/salon-service.jpg",
            booking_type: "salon",
            service_id: service.id
        })),
        hotel: BOOKING_CONFIG.SERVICES.hotel.map(service => ({
            name: service.name,
            description: `Comfortable accommodation for ${service.capacity} guests`,
            price: service.price,
            category: "Booking Services",
            subcategory: "Hotel",
            onsale: true,
            rating: 4.7,
            offer: 15,
            starttime: 0,
            endtime: 24,
            add_text: `Capacity: ${service.capacity} guests, Amenities: ${service.amenities.join(', ')}`,
            "image-1": "https://images.teyzee.site/booking/hotel-room.jpg",
            booking_type: "hotel",
            service_id: service.id
        }))
    };

    return bookingServices;
}

// Initialize booking system
const bookingManager = new BookingDataManager();
const googleCalendar = new GoogleCalendarIntegration();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BOOKING_CONFIG,
        GoogleCalendarIntegration,
        BookingDataManager,
        addBookingIntegration
    };
}