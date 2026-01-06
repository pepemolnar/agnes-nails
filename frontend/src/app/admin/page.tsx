'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Admin.css';

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

interface OpenHour {
  id: number;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
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

export default function AdminDashboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'appointments' | 'settings' | 'services'>('appointments');

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Settings state
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  // Open hours state
  const [openHours, setOpenHours] = useState<OpenHour[]>([]);
  const [openHoursLoading, setOpenHoursLoading] = useState(false);

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchAppointments();
    fetchBlockedDates();
    fetchOpenHours();
    fetchServices();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  // Appointments functions
  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        setAppointmentsError('Failed to fetch appointments');
      }
    } catch (err) {
      setAppointmentsError('Failed to fetch appointments');
      console.error(err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        setAppointmentsError('Failed to update status');
      }
    } catch (err) {
      setAppointmentsError('Failed to update status');
      console.error(err);
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        setAppointmentsError('Failed to delete appointment');
      }
    } catch (err) {
      setAppointmentsError('Failed to delete appointment');
      console.error(err);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const dateMatch = !filterDate || apt.date === filterDate;
    const statusMatch = filterStatus === 'all' || apt.status === filterStatus;
    return dateMatch && statusMatch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Settings functions
  const fetchBlockedDates = async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch(`${API_URL}/blocked-dates`);
      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data);
      } else {
        setSettingsError('Failed to fetch blocked dates');
      }
    } catch (err) {
      setSettingsError('Failed to fetch blocked dates');
      console.error(err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (!newDate || !newReason) {
      setSettingsError('Please fill in all fields');
      return;
    }

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/blocked-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: newDate,
          reason: newReason,
        }),
      });

      if (response.ok) {
        const createdDate = await response.json();
        setBlockedDates((prev) => [...prev, createdDate].sort((a, b) =>
          a.date.localeCompare(b.date)
        ));
        setNewDate('');
        setNewReason('');
        setSettingsSuccess('Date blocked successfully');
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        const errorData = await response.json();
        setSettingsError(errorData.message || 'Failed to block date');
      }
    } catch (err) {
      setSettingsError('Failed to block date');
      console.error(err);
    }
  };

  const handleDeleteBlockedDate = async (id: number) => {
    if (!confirm('Are you sure you want to unblock this date?')) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/blocked-dates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setBlockedDates((prev) => prev.filter((date) => date.id !== id));
        setSettingsSuccess('Date unblocked successfully');
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        setSettingsError('Failed to unblock date');
      }
    } catch (err) {
      setSettingsError('Failed to unblock date');
      console.error(err);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatBlockedDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Open hours functions
  const fetchOpenHours = async () => {
    setOpenHoursLoading(true);
    try {
      const response = await fetch(`${API_URL}/open-hours`);
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          await initializeOpenHours();
        } else {
          setOpenHours(data);
        }
      } else {
        setSettingsError('Failed to fetch open hours');
      }
    } catch (err) {
      setSettingsError('Failed to fetch open hours');
      console.error(err);
    } finally {
      setOpenHoursLoading(false);
    }
  };

  const initializeOpenHours = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/open-hours/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const fetchResponse = await fetch(`${API_URL}/open-hours`);
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setOpenHours(data);
          setSettingsSuccess('Business hours initialized successfully');
          setTimeout(() => setSettingsSuccess(''), 3000);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        setSettingsError('Failed to initialize open hours');
      }
    } catch (err) {
      setSettingsError('Failed to initialize open hours');
      console.error(err);
    }
  };

  const updateOpenHour = async (id: number, updates: Partial<OpenHour>) => {
    const token = localStorage.getItem('authToken');
    try {
      // Filter out null values - only send defined values to the API
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== null)
      );

      const response = await fetch(`${API_URL}/open-hours/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(filteredUpdates),
      });

      if (response.ok) {
        const updatedHour = await response.json();
        setOpenHours((prev) =>
          prev.map((hour) => (hour.id === id ? updatedHour : hour))
        );
        setSettingsSuccess('Open hours updated successfully');
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        const errorData = await response.json();
        setSettingsError(errorData.message || 'Failed to update open hours');
        console.error('Update error:', errorData);
      }
    } catch (err) {
      setSettingsError('Failed to update open hours');
      console.error(err);
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  // Services functions
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const response = await fetch(`${API_URL}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setSettingsError('Failed to fetch services');
      }
    } catch (err) {
      setSettingsError('Failed to fetch services');
      console.error(err);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');

    if (!newServiceName || !newServiceDuration) {
      setSettingsError('Please fill in all fields');
      return;
    }

    const duration = parseInt(newServiceDuration);
    if (isNaN(duration) || duration <= 0) {
      setSettingsError('Duration must be a positive number');
      return;
    }

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newServiceName,
          durationMinutes: duration,
          isActive: true,
        }),
      });

      if (response.ok) {
        const createdService = await response.json();
        setServices((prev) => [...prev, createdService].sort((a, b) => a.name.localeCompare(b.name)));
        setNewServiceName('');
        setNewServiceDuration('');
        setSettingsSuccess('Service added successfully');
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        const errorData = await response.json();
        setSettingsError(errorData.message || 'Failed to add service');
      }
    } catch (err) {
      setSettingsError('Failed to add service');
      console.error(err);
    }
  };

  const handleUpdateService = async (id: number, updates: Partial<Service>) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedService = await response.json();
        setServices((prev) =>
          prev.map((service) => (service.id === id ? updatedService : service))
        );
        setEditingService(null);
        setSettingsSuccess('Service updated successfully');
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        setSettingsError('Failed to update service');
      }
    } catch (err) {
      setSettingsError('Failed to update service');
      console.error(err);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setServices((prev) => prev.filter((service) => service.id !== id));
        setSettingsSuccess('Service deleted successfully');
        setTimeout(() => setSettingsSuccess(''), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      } else {
        setSettingsError('Failed to delete service');
      }
    } catch (err) {
      setSettingsError('Failed to delete service');
      console.error(err);
    }
  };

  const toggleServiceActive = async (id: number, currentStatus: boolean) => {
    await handleUpdateService(id, { isActive: !currentStatus });
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button
          className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <div className="section-header">
              <h2>Appointment Management</h2>
              <button onClick={fetchAppointments} className="refresh-button" disabled={appointmentsLoading}>
                {appointmentsLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            <div className="filters">
              <div className="filter-group">
                <label>Filter by Date:</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="filter-input"
                />
                {filterDate && (
                  <button onClick={() => setFilterDate('')} className="clear-filter">
                    Clear
                  </button>
                )}
              </div>

              <div className="filter-group">
                <label>Filter by Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {appointmentsError && <div className="error-message">{appointmentsError}</div>}

            <div className="stats">
              <div className="stat-card">
                <h3>Total</h3>
                <p className="stat-number">{appointments.length}</p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-number">{appointments.filter((a) => a.status === 'pending').length}</p>
              </div>
              <div className="stat-card">
                <h3>Confirmed</h3>
                <p className="stat-number">{appointments.filter((a) => a.status === 'confirmed').length}</p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-number">{appointments.filter((a) => a.status === 'completed').length}</p>
              </div>
            </div>

            <div className="appointments-table-container">
              {filteredAppointments.length === 0 ? (
                <div className="no-appointments">
                  <p>No appointments found</p>
                </div>
              ) : (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>{appointment.date}</td>
                        <td>{appointment.time}</td>
                        <td>{appointment.name}</td>
                        <td>{appointment.email}</td>
                        <td>{appointment.phone}</td>
                        <td>{appointment.service}</td>
                        <td className="notes-cell">{appointment.notes || '-'}</td>
                        <td>
                          <select
                            value={appointment.status}
                            onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                            className={`status-select status-${appointment.status}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{formatDate(appointment.createdAt)}</td>
                        <td>
                          <button
                            onClick={() => deleteAppointment(appointment.id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Blocked Dates Management</h2>
            <p className="section-description">
              Block specific dates to prevent clients from booking appointments. Useful for holidays, vacations, or maintenance days.
            </p>

            {settingsError && <div className="error-message">{settingsError}</div>}
            {settingsSuccess && <div className="success-message">{settingsSuccess}</div>}

            <div className="blocked-dates-container">
              <div className="add-blocked-date">
                <h3>Block a New Date</h3>
                <form onSubmit={handleAddBlockedDate} className="block-date-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="newDate">Date</label>
                      <input
                        type="date"
                        id="newDate"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={getTodayDate()}
                        className="date-input"
                        required
                      />
                    </div>

                    <div className="form-group flex-grow">
                      <label htmlFor="newReason">Reason</label>
                      <input
                        type="text"
                        id="newReason"
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        placeholder="e.g., Holiday - Salon Closed"
                        className="reason-input"
                        required
                        maxLength={100}
                      />
                    </div>

                    <button type="submit" className="add-button">
                      Block Date
                    </button>
                  </div>
                </form>
              </div>

              <div className="blocked-dates-list">
                <h3>Currently Blocked Dates ({blockedDates.length})</h3>

                {settingsLoading ? (
                  <div className="loading-message">Loading...</div>
                ) : blockedDates.length === 0 ? (
                  <div className="no-blocked-dates">
                    <p>No dates are currently blocked</p>
                    <p className="hint">Add a blocked date using the form above</p>
                  </div>
                ) : (
                  <div className="blocked-dates-grid">
                    {blockedDates.map((blockedDate) => (
                      <div key={blockedDate.id} className="blocked-date-card">
                        <div className="blocked-date-info">
                          <div className="blocked-date-header">
                            <span className="blocked-date-date">
                              {formatBlockedDate(blockedDate.date)}
                            </span>
                            <span className="blocked-date-raw">
                              {blockedDate.date}
                            </span>
                          </div>
                          <p className="blocked-date-reason">{blockedDate.reason}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteBlockedDate(blockedDate.id)}
                          className="unblock-button"
                          title="Unblock this date"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="open-hours-section">
              <div className="section-header">
                <div>
                  <h2>Business Hours</h2>
                  <p className="section-description">
                    Set your regular business hours for each day of the week. These hours will determine when clients can book appointments.
                  </p>
                </div>
                {openHours.length > 0 && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to reset business hours to default values? This will set Monday-Friday 9:00 AM - 5:00 PM and weekends closed.')) {
                        setOpenHoursLoading(true);
                        const token = localStorage.getItem('authToken');
                        try {
                          const response = await fetch(`${API_URL}/open-hours/reset`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                            },
                          });

                          if (response.ok) {
                            await fetchOpenHours();
                            setSettingsSuccess('Business hours reset to default successfully');
                            setTimeout(() => setSettingsSuccess(''), 3000);
                          } else if (response.status === 401) {
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('user');
                            router.push('/admin/login');
                          } else {
                            setSettingsError('Failed to reset open hours');
                          }
                        } catch (err) {
                          setSettingsError('Failed to reset open hours');
                          console.error(err);
                        } finally {
                          setOpenHoursLoading(false);
                        }
                      }
                    }}
                    className="reset-hours-button"
                  >
                    Reset to Default
                  </button>
                )}
              </div>

              {openHoursLoading ? (
                <div className="loading-message">Loading...</div>
              ) : (
                <div className="open-hours-grid">
                  {openHours.map((hour) => (
                    <div key={hour.id} className="open-hour-card">
                      <div className="day-header">
                        <h3>{getDayName(hour.dayOfWeek)}</h3>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={hour.isOpen}
                            onChange={(e) => {
                              const isOpen = e.target.checked;
                              const updates: Partial<OpenHour> = { isOpen };

                              // If opening and no times are set, provide defaults
                              if (isOpen) {
                                if (!hour.openTime) updates.openTime = '09:00';
                                if (!hour.closeTime) updates.closeTime = '17:00';
                              }

                              updateOpenHour(hour.id, updates);
                            }}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>

                      {hour.isOpen ? (
                        <div className="time-inputs">
                          <div className="time-group">
                            <label>Open</label>
                            <input
                              type="time"
                              value={hour.openTime || '09:00'}
                              onChange={(e) =>
                                updateOpenHour(hour.id, { openTime: e.target.value })
                              }
                              className="time-input"
                            />
                          </div>
                          <span className="time-separator">-</span>
                          <div className="time-group">
                            <label>Close</label>
                            <input
                              type="time"
                              value={hour.closeTime || '17:00'}
                              onChange={(e) =>
                                updateOpenHour(hour.id, { closeTime: e.target.value })
                              }
                              className="time-input"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="closed-indicator">Closed</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            <h2>Services Management</h2>
            <p className="section-description">
              Manage your salon services. Add, edit, or deactivate services that appear in the booking system.
            </p>

            {settingsError && <div className="error-message">{settingsError}</div>}
            {settingsSuccess && <div className="success-message">{settingsSuccess}</div>}

            <div className="services-container">
              <div className="add-service">
                <h3>Add New Service</h3>
                <form onSubmit={handleAddService} className="service-form">
                  <div className="form-row">
                    <div className="form-group flex-grow">
                      <label htmlFor="serviceName">Service Name</label>
                      <input
                        type="text"
                        id="serviceName"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        placeholder="e.g., Gel Manicure"
                        className="service-input"
                        required
                        maxLength={100}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="serviceDuration">Duration (minutes)</label>
                      <input
                        type="number"
                        id="serviceDuration"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        placeholder="e.g., 60"
                        className="service-input"
                        required
                        min="1"
                      />
                    </div>

                    <button type="submit" className="add-button">
                      Add Service
                    </button>
                  </div>
                </form>
              </div>

              <div className="services-list">
                <h3>Current Services ({services.length})</h3>

                {servicesLoading ? (
                  <div className="loading-message">Loading...</div>
                ) : services.length === 0 ? (
                  <div className="no-services">
                    <p>No services found</p>
                    <p className="hint">Add a service using the form above</p>
                  </div>
                ) : (
                  <div className="services-grid">
                    {services.map((service) => (
                      <div key={service.id} className={`service-card ${!service.isActive ? 'inactive' : ''}`}>
                        {editingService?.id === service.id ? (
                          <div className="service-edit-form">
                            <input
                              type="text"
                              value={editingService.name}
                              onChange={(e) =>
                                setEditingService({ ...editingService, name: e.target.value })
                              }
                              className="edit-input"
                            />
                            <input
                              type="number"
                              value={editingService.durationMinutes}
                              onChange={(e) =>
                                setEditingService({
                                  ...editingService,
                                  durationMinutes: parseInt(e.target.value),
                                })
                              }
                              className="edit-input"
                              min="1"
                            />
                            <div className="edit-actions">
                              <button
                                onClick={() => handleUpdateService(service.id, {
                                  name: editingService.name,
                                  durationMinutes: editingService.durationMinutes,
                                })}
                                className="save-button"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingService(null)}
                                className="cancel-button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="service-info">
                              <h4>{service.name}</h4>
                              <p className="service-duration">{service.durationMinutes} minutes</p>
                              <span className={`service-status ${service.isActive ? 'active' : 'inactive'}`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="service-actions">
                              <button
                                onClick={() => setEditingService(service)}
                                className="edit-button"
                                title="Edit service"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleServiceActive(service.id, service.isActive)}
                                className="toggle-button"
                                title={service.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {service.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteService(service.id)}
                                className="delete-button"
                                title="Delete service"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
