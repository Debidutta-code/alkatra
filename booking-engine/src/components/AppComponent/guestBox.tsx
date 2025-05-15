"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "@/Redux/store";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice";

const GuestBox: React.FC = () => {
  const dispatch = useDispatch();
  const { guestDetails } = useSelector((state) => state.hotel);
  const [error, setError] = useState<string | null>(null);

  // Set initial state using Redux store values (if available)
  const [modalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState(guestDetails?.rooms || 1);
  const [guests, setGuests] = useState(guestDetails?.guests || 1);
  const [children, setChildren] = useState(guestDetails?.children || 0);
  const [childAges, setChildAges] = useState(
    guestDetails?.childAges || Array.from({ length: guestDetails?.children || 0 }, () => 1)
  );
  const [displayText, setDisplayText] = useState(
    ` ${rooms} Rooms ${guests} Guests \n ${children} Children`
  );

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const incDecHandler = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number
  ) => {
    setter((prevValue) => Math.max(prevValue + delta, 1));
  };

  const handleChildrenChange = (value: number) => {
    setChildren(() => {
      const newValue = Math.max(value, 0);
      setChildAges(Array.from({ length: newValue }, () => 0));
      return newValue;
    });
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const newChildAges = [...childAges];
    newChildAges[index] = age;
    setChildAges(newChildAges);
  };

  const isChildAgeValid = () => {
    return children === 0 || childAges.every((age: number) => age > 0 && age < 14);
  };
  

  const handleApplyChanges = () => {
    if (isChildAgeValid()) {
      setDisplayText(`${rooms} Rooms ${guests} Guests\n${children} Children`);
      dispatch(
        setGuestDetails({
          rooms,
          guests,
          children,
          childAges,
        })
      );
      localStorage.setItem("guestDetails", JSON.stringify({ rooms, guests, children, childAges }));
      closeModal();
    } else {
      setError("Please select the child's age");
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <div
        className="w-full px-3 py-2 border rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
        onClick={openModal}
      >
<div className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
  {displayText || "Select guests"}
</div>

      </div>

      {modalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[80vh]">
              <div className="space-y-6">
                {/* Room Section */}
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Rooms</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-[#D80032] hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                      onClick={() => incDecHandler(setRooms, -1)}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{rooms}</span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-[#D80032] hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                      onClick={() => incDecHandler(setRooms, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Guests Section */}
                <div className="flex items-center justify-between">
                  <label className="text-gray-700">Guests</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-[#D80032] hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                      onClick={() => incDecHandler(setGuests, -1)}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{guests}</span>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-[#D80032] hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                      onClick={() => incDecHandler(setGuests, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Children Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-700" htmlFor="modalChildren">
                      Children
                    </label>
                    <select
                      id="modalChildren"
                      value={children}
                      onChange={(e) => handleChildrenChange(parseInt(e.target.value))}
                      className="w-24 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#D80032] focus:border-transparent"
                    >
                      {[0, 1, 2, 3, 4].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Child Age Selectors */}
                  {children > 0 && (
                    <div className="space-y-3 mt-4">
                      {Array.from({ length: children }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <label
                            className="text-gray-600 text-sm"
                            htmlFor={`childAge${index + 1}`}
                          >
                            Child {index + 1} Age
                          </label>
                          <select
                            id={`childAge${index + 1}`}
                            value={childAges[index]}
                            onChange={(e) => handleChildAgeChange(index, parseInt(e.target.value))}
                            className="w-24 p-2 border rounded-lg bg-white focus:ring-2 focus:ring-[#D80032] focus:border-transparent"
                          >
                            {Array.from({ length: 14 }, (_, i) => i).map((age) => (
                              <option key={age} value={age}>
                                {age}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    className="px-6 py-2 bg-[#D80032] hover:bg-red-500 text-white rounded-lg transition-colors"
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