"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "@/Redux/store";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice";

const GuestBox: React.FC = () => {
  const dispatch = useDispatch();
  const { guestDetails } = useSelector((state) => state.hotel);

  const [modalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState(Array.from({ length: 0 }, () => 0));
  const [displayText, setDisplayText] = useState(`${rooms} Rooms ${guests} Guests`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalOpen]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError(null); // Clear error when modal is closed
  };

  const incDecHandler = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    minValue: number = 1
  ) => {
    setter((prevValue) => Math.max(prevValue + delta, minValue));
  };

  const handleChildrenChange = (value: number) => {
    setChildren((prevChildren) => {
      const newValue = Math.max(value, 0);
      setChildAges(Array.from({ length: newValue }, () => 0)); // Set default age to 0
      return newValue;
    });
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const newChildAges = [...childAges];
    newChildAges[index] = age;
    setChildAges(newChildAges);
  };

  const isChildAgeValid = () => {
    return childAges.every((age) => age > 0 && age < 14);
  };

  const handleApplyChanges = () => {
    if (children === 0 || isChildAgeValid()) {
      setDisplayText(`${rooms} ${rooms === 1 ? 'Room' : 'Rooms'} ${guests} ${guests === 1 ? 'Guest' : 'Guests'}`);
      dispatch(
        setGuestDetails({
          rooms,
          guests,
          children,
          childAges,
        })
      );
      closeModal();
    } else {
      setError("Please select the child's age");
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button - Matches the image design */}
      <div
        className="w-full px-3 py-2.5 flex items-center cursor-pointer transition-colors"
        onClick={openModal}
      >
        <div className="flex items-center space-x-2.5">
          {/* <User size={18} className="text-gray-500" /> */}
          <span className="text-gray-700 text-sm">
            {displayText || "Select guests"}
          </span>
        </div>
      </div>

      {modalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 overflow-y-auto max-h-[80vh] animate-fadeIn">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-100">
                  Select guests
                </h3>
                
                {/* Rooms Section */}
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-medium">Rooms</label>
                  <div className="flex items-center gap-3">
                    <button
                      className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => incDecHandler(setRooms, -1)}
                      disabled={rooms <= 1}
                    >
                      <span className="text-lg">-</span>
                    </button>
                    <span className="w-8 text-center text-gray-800">{rooms}</span>
                    <button
                      className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center transition-colors hover:bg-gray-50"
                      onClick={() => incDecHandler(setRooms, 1)}
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>

                {/* Guests Section */}
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-medium">Guests</label>
                  <div className="flex items-center gap-3">
                    <button
                      className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-50"
                      onClick={() => incDecHandler(setGuests, -1)}
                      disabled={guests <= 1}
                    >
                      <span className="text-lg">-</span>
                    </button>
                    <span className="w-8 text-center text-gray-800">{guests}</span>
                    <button
                      className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center transition-colors hover:bg-gray-50"
                      onClick={() => incDecHandler(setGuests, 1)}
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>

                {/* Children Section */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700 font-medium" htmlFor="modalChildren">
                      Children <span className="text-xs text-gray-500">(ages 0-13)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center transition-colors hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => incDecHandler(setChildren, -1, 0)}
                        disabled={children <= 0}
                      >
                        <span className="text-lg">-</span>
                      </button>
                      <span className="w-8 text-center text-gray-800">{children}</span>
                      <button
                        className="w-9 h-9 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center transition-colors hover:bg-gray-50"
                        onClick={() => incDecHandler(setChildren, 1, 0)}
                      >
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Child Age Selectors */}
                  {children > 0 && (
                    <div className="space-y-3 mt-4 pl-4">
                      {Array.from({ length: children }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <label 
                            className="text-gray-600 text-sm" 
                            htmlFor={`childAge${index + 1}`}
                          >
                            Child {index + 1} age
                          </label>
                          <select
                            id={`childAge${index + 1}`}
                            value={childAges[index]}
                            onChange={(e) => handleChildAgeChange(index, parseInt(e.target.value))}
                            className="w-24 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none text-sm"
                          >
                            <option value={0} disabled>Select age</option>
                            {Array.from({ length: 14 }, (_, i) => i).slice(1).map((age) => (
                              <option key={age} value={age}>
                                {age} {age === 1 ? 'year' : 'years'}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white rounded-lg transition-colors shadow-md"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GuestBox;