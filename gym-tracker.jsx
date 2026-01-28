import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, X, Check, Settings, Play } from 'lucide-react';

export default function GymTracker() {
  const [gymDates, setGymDates] = useState([]);
  const [playlists, setPlaylists] = useState({
    'Upper Body': [],
    'Lower Body': [],
    'Full Body': []
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'edit-playlists', 'select-workout', 'active-workout'
  const [showPlaylistEditor, setShowPlaylistEditor] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newExercise, setNewExercise] = useState({ name: '', weight: '', reps: '', sets: '' });
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [streak, setStreak] = useState(0);

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const datesResult = await window.storage.get('gym-dates');
        if (datesResult) {
          const dates = JSON.parse(datesResult.value);
          setGymDates(dates);
          calculateStreak(dates);
        }
      } catch (error) {
        console.log('No saved gym dates');
      }

      try {
        const playlistsResult = await window.storage.get('playlists');
        if (playlistsResult) {
          setPlaylists(JSON.parse(playlistsResult.value));
        }
      } catch (error) {
        console.log('No saved playlists');
      }
    };
    loadData();
  }, []);

  // Calculate streak
  const calculateStreak = (dates) => {
    if (dates.length === 0) {
      setStreak(0);
      return;
    }

    const sortedDates = dates
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const hasWorkout = sortedDates.some(d => {
        const workoutDate = new Date(d);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === checkDate.getTime();
      });

      if (hasWorkout) {
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  // Save gym dates
  const saveGymDates = async (dates) => {
    try {
      await window.storage.set('gym-dates', JSON.stringify(dates));
      calculateStreak(dates);
    } catch (error) {
      console.error('Failed to save gym dates:', error);
    }
  };

  // Save playlists
  const savePlaylists = async (lists) => {
    try {
      await window.storage.set('playlists', JSON.stringify(lists));
    } catch (error) {
      console.error('Failed to save playlists:', error);
    }
  };

  const logGymToday = () => {
    const today = new Date().toDateString();
    if (!gymDates.includes(today)) {
      const newDates = [...gymDates, today];
      setGymDates(newDates);
      saveGymDates(newDates);
    }
  };

  const startWorkout = (playlistName) => {
    setActiveWorkout(playlistName);
    setCurrentExerciseIndex(0);
    setCurrentScreen('active-workout');
  };

  const nextExercise = () => {
    if (currentExerciseIndex < playlists[activeWorkout].length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const finishWorkout = (completed = false) => {
    if (completed) {
      logGymToday();
    }
    setActiveWorkout(null);
    setCurrentExerciseIndex(0);
    setCurrentScreen('home');
  };

  const addPlaylist = () => {
    if (newPlaylistName.trim() && !playlists[newPlaylistName.trim()]) {
      const newPlaylists = { ...playlists, [newPlaylistName.trim()]: [] };
      setPlaylists(newPlaylists);
      savePlaylists(newPlaylists);
      setNewPlaylistName('');
    }
  };

  const openPlaylistEditor = (playlistName) => {
    setEditingPlaylist(playlistName);
    setShowPlaylistEditor(true);
  };

  const addExercise = () => {
    if (newExercise.name.trim() && editingPlaylist) {
      const updatedPlaylists = { ...playlists };
      updatedPlaylists[editingPlaylist] = [
        ...updatedPlaylists[editingPlaylist],
        { ...newExercise, id: Date.now() }
      ];
      setPlaylists(updatedPlaylists);
      savePlaylists(updatedPlaylists);
      setNewExercise({ name: '', weight: '', reps: '', sets: '' });
    }
  };

  const updateExercise = (exerciseId, field, value) => {
    const updatedPlaylists = { ...playlists };
    const exerciseIndex = updatedPlaylists[editingPlaylist].findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex !== -1) {
      updatedPlaylists[editingPlaylist][exerciseIndex][field] = value;
      setPlaylists(updatedPlaylists);
      savePlaylists(updatedPlaylists);
    }
  };

  const deleteExercise = (exerciseId) => {
    const updatedPlaylists = { ...playlists };
    updatedPlaylists[editingPlaylist] = updatedPlaylists[editingPlaylist].filter(ex => ex.id !== exerciseId);
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
  };

  const deletePlaylist = (playlistName) => {
    const updatedPlaylists = { ...playlists };
    delete updatedPlaylists[playlistName];
    setPlaylists(updatedPlaylists);
    savePlaylists(updatedPlaylists);
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isGymDay = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return gymDates.includes(checkDate.toDateString());
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1d1d1f'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          
          input:focus, textarea:focus {
            outline: none;
            border-color: #1d1d1f;
          }
          
          button:active {
            transform: scale(0.98);
          }
        `}</style>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '40px',
            paddingTop: '20px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <Dumbbell size={32} color="#1d1d1f" strokeWidth={1.5} />
              <h1 style={{
                fontSize: '32px',
                margin: 0,
                fontWeight: '600',
                letterSpacing: '-0.5px'
              }}>
                Gym Tracker
              </h1>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#86868b',
              margin: 0
            }}>
              Track your workouts
            </p>
          </div>

          {/* Streak Counter */}
          {streak > 0 && (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid #d2d2d7',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '8px'
              }}>
                🔥
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {streak} Day Streak
              </div>
              <div style={{
                fontSize: '14px',
                color: '#86868b'
              }}>
                Keep it going!
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ marginBottom: '30px', display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setCurrentScreen('select-workout')}
              style={{
                flex: 1,
                padding: '18px',
                fontSize: '16px',
                fontWeight: '500',
                background: '#1d1d1f',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Start Workout
            </button>
            <button
              onClick={() => setCurrentScreen('edit-playlists')}
              style={{
                padding: '18px',
                fontSize: '16px',
                fontWeight: '500',
                background: '#fff',
                border: '1px solid #d2d2d7',
                borderRadius: '12px',
                color: '#1d1d1f',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Calendar */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #d2d2d7',
            marginBottom: '20px'
          }}>
            {/* Calendar Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <button
                onClick={() => changeMonth(-1)}
                style={{
                  background: '#f5f5f7',
                  border: '1px solid #d2d2d7',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#1d1d1f'
                }}
              >
                <ChevronLeft size={20} />
              </button>
              
              <h2 style={{
                fontSize: '18px',
                margin: 0,
                fontWeight: '600'
              }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => changeMonth(1)}
                style={{
                  background: '#f5f5f7',
                  border: '1px solid #d2d2d7',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#1d1d1f'
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day labels */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px'
            }}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#86868b',
                  padding: '8px 0'
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px'
            }}>
              {/* Empty cells for days before month starts */}
              {[...Array(startingDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {/* Days of the month */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isGym = isGymDay(day);
                
                return (
                  <div
                    key={day}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: isGym ? '#34c759' : 'transparent',
                      color: isGym ? '#fff' : '#1d1d1f',
                      fontSize: '15px',
                      fontWeight: isGym ? '600' : '400',
                      border: isGym ? 'none' : '1px solid transparent'
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          {gymDates.length > 0 && (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #d2d2d7'
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '600',
                color: '#1d1d1f',
                marginBottom: '4px'
              }}>
                {gymDates.length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#86868b'
              }}>
                Total Sessions
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Edit Playlists Screen
  if (currentScreen === 'edit-playlists') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1d1d1f'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
            paddingTop: '20px'
          }}>
            <button
              onClick={() => setCurrentScreen('home')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                marginRight: '12px',
                color: '#1d1d1f'
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <h1 style={{
              fontSize: '28px',
              margin: 0,
              fontWeight: '600',
              letterSpacing: '-0.5px'
            }}>
              Edit Workouts
            </h1>
          </div>

          {/* Playlist List */}
          <div style={{ marginBottom: '20px' }}>
            {Object.keys(playlists).map((playlistName) => (
              <div
                key={playlistName}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #d2d2d7'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {playlistName}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#86868b'
                    }}>
                      {playlists[playlistName].length} exercises
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openPlaylistEditor(playlistName)}
                      style={{
                        padding: '10px',
                        background: '#f5f5f7',
                        border: '1px solid #d2d2d7',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#1d1d1f'
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${playlistName}" playlist?`)) {
                          deletePlaylist(playlistName);
                        }
                      }}
                      style={{
                        padding: '10px',
                        background: '#f5f5f7',
                        border: '1px solid #d2d2d7',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#ff3b30'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Playlist */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #d2d2d7'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Create New Playlist
            </h2>
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              onKeyPress={(e) => e.key === 'Enter' && addPlaylist()}
              style={{
                width: '100%',
                padding: '12px',
                background: '#f5f5f7',
                border: '1px solid #d2d2d7',
                borderRadius: '8px',
                fontSize: '15px',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={addPlaylist}
              disabled={!newPlaylistName.trim()}
              style={{
                width: '100%',
                padding: '12px',
                background: newPlaylistName.trim() ? '#1d1d1f' : '#d2d2d7',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: newPlaylistName.trim() ? 'pointer' : 'not-allowed',
                fontSize: '15px',
                fontWeight: '500'
              }}
            >
              Create Playlist
            </button>
          </div>

          {/* Playlist Editor Modal */}
          {showPlaylistEditor && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }} className="fade-in">
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    {editingPlaylist}
                  </h2>
                  <button
                    onClick={() => {
                      setShowPlaylistEditor(false);
                      setEditingPlaylist(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#86868b'
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Exercise List */}
                <div style={{ marginBottom: '20px' }}>
                  {playlists[editingPlaylist]?.map((exercise) => (
                    <div
                      key={exercise.id}
                      style={{
                        background: '#f5f5f7',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '12px',
                        border: '1px solid #d2d2d7'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: '8px'
                      }}>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            fontSize: '15px',
                            fontWeight: '500',
                            padding: '4px 0'
                          }}
                        />
                        <button
                          onClick={() => deleteExercise(exercise.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ff3b30',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '8px'
                      }}>
                        <div>
                          <label style={{
                            fontSize: '12px',
                            color: '#86868b',
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            Weight
                          </label>
                          <input
                            type="text"
                            value={exercise.weight}
                            onChange={(e) => updateExercise(exercise.id, 'weight', e.target.value)}
                            placeholder="0 lbs"
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              background: '#fff',
                              border: '1px solid #d2d2d7',
                              borderRadius: '6px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            fontSize: '12px',
                            color: '#86868b',
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            Reps
                          </label>
                          <input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                            placeholder="0"
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              background: '#fff',
                              border: '1px solid #d2d2d7',
                              borderRadius: '6px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{
                            fontSize: '12px',
                            color: '#86868b',
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            Sets
                          </label>
                          <input
                            type="text"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                            placeholder="0"
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              background: '#fff',
                              border: '1px solid #d2d2d7',
                              borderRadius: '6px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Exercise */}
                <div style={{ 
                  paddingTop: '20px', 
                  borderTop: '1px solid #d2d2d7'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    Add Exercise
                  </h3>
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                    placeholder="Exercise name"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#f5f5f7',
                      border: '1px solid #d2d2d7',
                      borderRadius: '8px',
                      fontSize: '15px',
                      marginBottom: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <input
                      type="text"
                      value={newExercise.weight}
                      onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                      placeholder="Weight"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#f5f5f7',
                        border: '1px solid #d2d2d7',
                        borderRadius: '8px',
                        fontSize: '15px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="text"
                      value={newExercise.reps}
                      onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                      placeholder="Reps"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#f5f5f7',
                        border: '1px solid #d2d2d7',
                        borderRadius: '8px',
                        fontSize: '15px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="text"
                      value={newExercise.sets}
                      onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                      placeholder="Sets"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#f5f5f7',
                        border: '1px solid #d2d2d7',
                        borderRadius: '8px',
                        fontSize: '15px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    onClick={addExercise}
                    disabled={!newExercise.name.trim()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: newExercise.name.trim() ? '#1d1d1f' : '#d2d2d7',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: newExercise.name.trim() ? 'pointer' : 'not-allowed',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  >
                    Add Exercise
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Select Workout Screen
  if (currentScreen === 'select-workout') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1d1d1f'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
            paddingTop: '20px'
          }}>
            <button
              onClick={() => setCurrentScreen('home')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                marginRight: '12px',
                color: '#1d1d1f'
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <h1 style={{
              fontSize: '28px',
              margin: 0,
              fontWeight: '600',
              letterSpacing: '-0.5px'
            }}>
              Select Workout
            </h1>
          </div>

          {/* Playlist Options */}
          <div>
            {Object.keys(playlists).map((playlistName) => (
              <button
                key={playlistName}
                onClick={() => startWorkout(playlistName)}
                disabled={playlists[playlistName].length === 0}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid #d2d2d7',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '12px',
                  cursor: playlists[playlistName].length > 0 ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  opacity: playlists[playlistName].length === 0 ? 0.5 : 1
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#1d1d1f'
                    }}>
                      {playlistName}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#86868b'
                    }}>
                      {playlists[playlistName].length} exercises
                    </div>
                  </div>
                  {playlists[playlistName].length > 0 && (
                    <Play size={24} color="#1d1d1f" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {Object.keys(playlists).every(name => playlists[name].length === 0) && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#86868b'
            }}>
              <p style={{ marginBottom: '16px' }}>No workouts created yet</p>
              <button
                onClick={() => setCurrentScreen('edit-playlists')}
                style={{
                  padding: '12px 24px',
                  background: '#1d1d1f',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                Create Your First Workout
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active Workout Screen
  if (currentScreen === 'active-workout' && activeWorkout) {
    const exercises = playlists[activeWorkout];
    const currentExercise = exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex + 1) / exercises.length) * 100;

    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1d1d1f'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '30px',
            paddingTop: '20px'
          }}>
            <h1 style={{
              fontSize: '24px',
              margin: 0,
              fontWeight: '600',
              letterSpacing: '-0.5px'
            }}>
              {activeWorkout}
            </h1>
            <button
              onClick={() => finishWorkout(false)}
              style={{
                padding: '8px 16px',
                background: '#1d1d1f',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Finish
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: '#d2d2d7',
            borderRadius: '8px',
            height: '8px',
            marginBottom: '30px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#1d1d1f',
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Exercise Info */}
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '30px',
            border: '1px solid #d2d2d7',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#86868b',
              marginBottom: '12px'
            }}>
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              marginBottom: '32px',
              letterSpacing: '-0.5px'
            }}>
              {currentExercise.name}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#86868b',
                  marginBottom: '8px'
                }}>
                  Weight
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '600'
                }}>
                  {currentExercise.weight || '-'}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#86868b',
                  marginBottom: '8px'
                }}>
                  Reps
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '600'
                }}>
                  {currentExercise.reps || '-'}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#86868b',
                  marginBottom: '8px'
                }}>
                  Sets
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: '600'
                }}>
                  {currentExercise.sets || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={previousExercise}
              disabled={currentExerciseIndex === 0}
              style={{
                flex: 1,
                padding: '18px',
                background: currentExerciseIndex === 0 ? '#f5f5f7' : '#fff',
                border: '1px solid #d2d2d7',
                borderRadius: '12px',
                color: currentExerciseIndex === 0 ? '#86868b' : '#1d1d1f',
                cursor: currentExerciseIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <button
              onClick={() => {
                if (currentExerciseIndex === exercises.length - 1) {
                  finishWorkout(true);
                } else {
                  nextExercise();
                }
              }}
              style={{
                flex: 1,
                padding: '18px',
                background: '#1d1d1f',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {currentExerciseIndex === exercises.length - 1 ? (
                <>
                  <Check size={20} />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Exercise List Preview */}
          <div style={{
            marginTop: '30px',
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #d2d2d7'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              Remaining Exercises
            </h3>
            <div>
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    background: index === currentExerciseIndex ? '#f5f5f7' : 'transparent',
                    opacity: index < currentExerciseIndex ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: index < currentExerciseIndex ? '#1d1d1f' : index === currentExerciseIndex ? '#1d1d1f' : '#d2d2d7',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {index < currentExerciseIndex ? '✓' : index + 1}
                  </div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: index === currentExerciseIndex ? '600' : '400'
                  }}>
                    {exercise.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
