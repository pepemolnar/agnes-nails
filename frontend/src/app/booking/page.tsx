'use client';

import { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './Booking.css';

interface Appointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BlockedDate {
  id: number;
  date: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OpenHour {
  id: number;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function Booking() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [openHours, setOpenHours] = useState<OpenHour[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateWarning, setDateWarning] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
  ];

  // Fetch all appointments, blocked dates, services, and open hours
  useEffect(() => {
    fetchAppointments();
    fetchBlockedDates();
    fetchServices();
    fetchOpenHours();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const response = await fetch(`${API_URL}/blocked-dates`);
      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data);
      }
    } catch (err) {
      console.error('Failed to fetch blocked dates:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services/active`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  const fetchOpenHours = async () => {
    try {
      const response = await fetch(`${API_URL}/open-hours`);
      if (response.ok) {
        const data = await response.json();
        setOpenHours(data);
      }
    } catch (err) {
      console.error('Failed to fetch open hours:', err);
    }
  };

  // Convert time slot (e.g., "9:00 AM") to 24-hour format (e.g., "09:00")
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = modifier === 'AM' ? '00' : '12';
    } else {
      hours = modifier === 'PM' ? String(parseInt(hours, 10) + 12) : hours;
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Get day of week from date string (0 = Sunday, 6 = Saturday)
  const getDayOfWeek = (dateString: string): number => {
    const date = new Date(dateString + 'T00:00:00');
    return date.getDay();
  };

  // Get open hours for a specific day
  const getOpenHoursForDay = (dayOfWeek: number): OpenHour | undefined => {
    return openHours.find((hour) => hour.dayOfWeek === dayOfWeek);
  };

  // Check if a time slot is within open hours
  const isTimeSlotInOpenHours = (timeSlot: string, selectedDate: string): boolean => {
    if (!selectedDate) return true;

    const dayOfWeek = getDayOfWeek(selectedDate);
    const dayOpenHours = getOpenHoursForDay(dayOfWeek);

    // If no open hours data or day is closed, hide all time slots
    if (!dayOpenHours || !dayOpenHours.isOpen || !dayOpenHours.openTime || !dayOpenHours.closeTime) {
      return false;
    }

    const slotTime24 = convertTo24Hour(timeSlot);
    return slotTime24 >= dayOpenHours.openTime && slotTime24 <= dayOpenHours.closeTime;
  };

  // Check if a date is blocked
  const isDateBlocked = (selectedDate: string): boolean => {
    return blockedDates.some((blocked) => blocked.date === selectedDate);
  };

  // Get blocked date reason
  const getBlockedDateReason = (selectedDate: string): string | null => {
    const blocked = blockedDates.find((b) => b.date === selectedDate);
    return blocked ? blocked.reason : null;
  };

  // Get service duration by name
  const getServiceDuration = (serviceName: string): number => {
    const service = services.find((s) => s.name === serviceName);
    return service ? service.durationMinutes : 60; // Default to 60 minutes if not found
  };

  // Add minutes to a time string (HH:MM format)
  const addMinutesToTime = (time24h: string, minutes: number): string => {
    const [hours, mins] = time24h.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  // Check if a time slot is available (considering service duration)
  const isTimeSlotAvailable = (timeSlot: string): boolean => {
    if (!formData.date) return true;

    const slotTime24 = convertTo24Hour(timeSlot);

    // Get the duration of the currently selected service
    const selectedServiceDuration = formData.service ? getServiceDuration(formData.service) : 60;
    const slotEndTime24 = addMinutesToTime(slotTime24, selectedServiceDuration);

    // Check if this time slot conflicts with any existing appointment
    for (const apt of appointments) {
      if (apt.date !== formData.date) continue;

      const aptStartTime24 = convertTo24Hour(apt.time);
      const aptDuration = getServiceDuration(apt.service);
      const aptEndTime24 = addMinutesToTime(aptStartTime24, aptDuration);

      // Check if the time slot falls within this appointment's duration
      // OR if the new appointment would overlap with this existing appointment
      const startsWithinExisting = slotTime24 >= aptStartTime24 && slotTime24 < aptEndTime24;
      const endsAfterExistingStarts = slotEndTime24 > aptStartTime24 && slotTime24 < aptStartTime24;

      if (startsWithinExisting || endsAfterExistingStarts) {
        return false;
      }
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Check if the selected date is blocked or closed
    if (name === 'date') {
      if (isDateBlocked(value)) {
        const reason = getBlockedDateReason(value);
        setDateWarning(`This date is not available: ${reason}`);
        setFormData((prev) => ({
          ...prev,
          [name]: '',
          time: '', // Reset time selection
        }));
        return;
      }

      // Check if the selected day is closed
      const dayOfWeek = getDayOfWeek(value);
      const dayOpenHours = getOpenHoursForDay(dayOfWeek);
      if (!dayOpenHours || !dayOpenHours.isOpen) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        setDateWarning(`We are closed on ${dayNames[dayOfWeek]}s. Please select another date.`);
        setFormData((prev) => ({
          ...prev,
          [name]: '',
          time: '', // Reset time selection
        }));
        return;
      }

      setDateWarning('');
      // Reset time when date changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        time: '',
      }));
      return;
    }

    // If service changes, reset time selection as available slots may change
    if (name === 'service') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        time: '', // Reset time selection when service changes
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments((prev) => [...prev, newAppointment]);
        setSubmitted(true);
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            date: '',
            time: '',
            service: '',
            notes: '',
          });
        }, 5000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create appointment');
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      }
    } catch (err) {
      setError('Failed to create appointment. Please try again.');
      console.error('Error creating appointment:', err);
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="booking">
      <section className="booking-hero">
        <h1>Book Your Appointment</h1>
        <p>We can't wait to pamper you!</p>
      </section>

      <section className="booking-form-section">
        <div className="booking-container">
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Foglalást rögzítettük!</h2>
              <p>Thank you for choosing Agnes Nails!</p>
              <p>
                Foglalását a következő szolgáltatásra? <strong>{formData.service}</strong> rögzítettük az alábbi időpontra:{' '}
                <strong>{formData.date}</strong> <strong>{formData.time}</strong>.
              </p>
              <p className="confirmation-note">
                Amennyiben foglalását elfogadtuk, visszaigazolást küldünk a <strong>{formData.email}</strong> email címre.
              </p>
            </div>
          ) : (
            <>
              <div className="booking-info">
                <h2>Foglalj időpontot</h2>
                <p>
                  Töltsd ki az alábbi űrlapot a foglaláshoz. 24 órán belül email-ben jelzünk a foglalással kapcsolatban.
                </p>
                <div className="info-box">
                  <h3>Foglalási információk</h3>
                  <ul>
                    <li>Kérlek érkezz legalább 5 perccel az időpontod előtt</li>
                    <li>A lemondásokat legalább 24 órával az időpont előtt jelezd</li>
                  </ul>
                </div>
              </div>

              <form className="booking-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="name">Teljes név *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email cím *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefonszám *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service">Szolgáltatás *</label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Válassz szolgáltatást...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} ({service.durationMinutes} perc)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="date">Dátum *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={getTodayDate()}
                    required
                  />
                  {dateWarning && (
                    <p className="warning-text">{dateWarning}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="time">Időpont *</label>
                  {!formData.date && (
                    <p className="helper-text">Először válassz dátumot</p>
                  )}
                  <select
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    disabled={!formData.date}
                  >
                    <option value="">Válassz időpontot...</option>
                    {timeSlots.map((slot, index) => {
                      const isAvailable = isTimeSlotAvailable(slot);
                      const isInOpenHours = isTimeSlotInOpenHours(slot, formData.date);
                      const canBook = isAvailable && isInOpenHours;

                      // Don't show time slots outside open hours
                      if (!isInOpenHours) return null;

                      return (
                        <option key={index} value={slot} disabled={!canBook}>
                          {slot} {!isAvailable ? '(Booked)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Különleges kérés (opcionális)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Any special requests or preferences?"
                  ></textarea>
                </div>

                <div className="form-group recaptcha-container">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={'6Lc94EEsAAAAAJfMuaaD8NBtkQgU40sFenhtVZ7g'}
                    onChange={(token) => setRecaptchaToken(token)}
                    onExpired={() => setRecaptchaToken(null)}
                  />
                </div>

                <button type="submit" className="submit-button" disabled={loading || !recaptchaToken}>
                  {loading ? 'Foglalás...' : 'Időpont foglalása'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
