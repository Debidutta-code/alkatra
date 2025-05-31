"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "@/Redux/store";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice";
import { createPortal } from "react-dom";
import { Users } from "lucide-react";

// Define props interface
interface GuestBoxProps {
  onChange?: (guestDetails: {
    rooms: number;
    guests: number;
    children: number;
    childAges: number[];
  }) => void;
}

const GuestBox: React.FC<GuestBoxProps> = ({ onChange }) => {
  const dispatch = useDispatch();
  const { guestDetails } = useSelector((state) => state.hotel);
  const [modalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState(guestDetails?.rooms || 1);
  const [guests, setGuests] = useState(guestDetails?.guests || 1);
  const [children, setChildren] = useState(guestDetails?.children || 0);
  const [childAges, setChildAges] = useState(guestDetails?.childAges || Array.from({ length: 0 }, () => 0));
  const [displayText, setDisplayText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Update display text when component mounts or guestDetails changes
  useEffect(() => {
    updateDisplayText();
  }, [guestDetails]);

  // Function to update display text in OTA style
  const updateDisplayText = () => {
    const roomsToUse = guestDetails?.rooms || rooms || 1;
    const guestsToUse = guestDetails?.guests || guests || 1;
    const childrenToUse = guestDetails?.children || children || 0;

    setDisplayText(
      `${roomsToUse} ${roomsToUse === 1 ? "Room" : "Rooms"} · ${guestsToUse} ${guestsToUse === 1 ? "Adult" : "Adults"
      }${childrenToUse > 0 ? ` · ${childrenToUse} ${childrenToUse === 1 ? "Child" : "Children"}` : ""}`
    );
  };

  // Sync state with Redux when guestDetails changes
  useEffect(() => {
    if (guestDetails) {
      setRooms(guestDetails.rooms || 1);
      setGuests(guestDetails.guests || 1);
      setChildren(guestDetails.children || 0);
      setChildAges(guestDetails.childAges || []);
      updateDisplayText();
    }
  }, [guestDetails]);

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
    setError(null);
  };
  const incDecHandler = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number,
    minValue: number = 1
  ) => {
    setter((prevValue) => Math.max(prevValue + delta, minValue));
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
    return childAges.every((age: number) => age > 0 && age < 14);
  };

  const validateGuestCount = () => {
    // Typical max guests per room - 4 is standard for most hotels
    const maxGuestsPerRoom = 4;

    // Total guests including children
    const totalGuests = guests + children;

    // Maximum allowed guests based on room count
    const maxAllowedGuests = rooms * maxGuestsPerRoom;

    if (totalGuests > maxAllowedGuests) {
      setError(`Maximum ${maxGuestsPerRoom} guests allowed per room. Please add more rooms or reduce guests.`);
      return false;
    }

    return true;
  };

  const handleApplyChanges = () => {
    if (!validateGuestCount()) {
      return;
    }

    if (children === 0 || isChildAgeValid()) {
      // Create guest data object
      const guestData = {
        rooms,
        guests,
        children,
        childAges,
      };

      // Update display text in OTA style
      setDisplayText(
        `${rooms} ${rooms === 1 ? "Room" : "Rooms"} · ${guests} ${guests === 1 ? "Adult" : "Adults"
        }${children > 0 ? ` · ${children} ${children === 1 ? "Child" : "Children"}` : ""}`
      );

      // Dispatch to Redux
      dispatch(setGuestDetails(guestData));

      // Call onChange callback if provided
      if (onChange) {
        onChange(guestData);
      }

      closeModal();
    } else {
      setError("Please select the child's age");
    }
  };

  const modalContent = modalOpen ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-black/30 backdrop-blur-sm z-[999]"
        onClick={closeModal}
      />
      {/* Modal */}
      <div className="fixed top-0 left-0 w-full h-full z-[1000] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-tripswift-off-white rounded-xl shadow-xl p-6 overflow-y-auto max-h-[80vh] animate-fadeIn">
          <div className="space-y-6">
            <h3 className="text-lg font-tripswift-extrabold text-tripswift-black pb-2 border-b border-tripswift-black/10">
              Select guests
            </h3>
            {/* Rooms Section */}
            <div className="flex items-center justify-between">
              <label className="text-tripswift-black font-tripswift-medium uppercase">
                Rooms
              </label>
              <div className="flex items-center gap-3">
                <button
                  className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50"
                  onClick={() => incDecHandler(setRooms, -1)}
                  disabled={rooms <= 1}
                >
                  <span className="text-lg">-</span>
                </button>
                <span className="w-8 text-center text-tripswift-black font-tripswift-medium">
                  {rooms}
                </span>
                <button
                  className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10"
                  onClick={() => incDecHandler(setRooms, 1)}
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>
            {/* Guests Section */}
            <div className="flex items-center justify-between">
              <label className="text-tripswift-black font-tripswift-medium uppercase">
                Adults
              </label>
              <div className="flex items-center gap-3">
                <button
                  className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50"
                  onClick={() => incDecHandler(setGuests, -1)}
                  disabled={guests <= 1}
                >
                  <span className="text-lg">-</span>
                </button>
                <span className="w-8 text-center text-tripswift-black font-tripswift-medium">
                  {guests}
                </span>
                <button
                  className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10"
                  onClick={() => incDecHandler(setGuests, 1)}
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>
            {/* Children Section */}
            <div className="space-y-3 pt-2 border-t border-tripswift-black/10">
              <div className="flex items-center justify-between">
                <label
                  className="text-tripswift-black font-tripswift-medium uppercase"
                  htmlFor="modalChildren"
                >
                  Children{" "}
                  <span className="text-xs text-tripswift-black/60">
                    (ages 0-13)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50"
                    onClick={() => handleChildrenChange(children - 1)}
                    disabled={children <= 0}
                  >
                    <span className="text-lg">-</span>
                  </button>
                  <span className="w-8 text-center text-tripswift-black font-tripswift-medium">
                    {children}
                  </span>
                  <button
                    className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10"
                    onClick={() => handleChildrenChange(children + 1)}
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>
              {/* Child Age Selectors */}
              {children > 0 && (
                <div className="space-y-3 mt-4 pl-4">
                  {Array.from({ length: children }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <label
                        className="text-tripswift-black/70 text-sm font-tripswift-medium"
                        htmlFor={`childAge${index + 1}`}
                      >
                        Child {index + 1} age
                      </label>
                      <select
                        id={`childAge${index + 1}`}
                        value={childAges[index]}
                        onChange={(e) =>
                          handleChildAgeChange(index, parseInt(e.target.value))
                        }
                        className="w-30 p-2 border border-tripswift-black/20 rounded-lg bg-tripswift-off-white focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue outline-none text-sm text-tripswift-black font-tripswift-medium"
                      >
                        <option value={0} disabled>
                          Select age
                        </option>
                        {Array.from({ length: 14 }, (_, i) => i)
                          .slice(1)
                          .map((age) => (
                            <option key={age} value={age}>
                              {age} {age === 1 ? "year" : "years"}
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
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-tripswift-black/10">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-tripswift-black/60 hover:text-tripswift-black font-tripswift-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyChanges}
                className="btn-tripswift-primary px-6 py-2.5"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <div className="relative">
      {/* Trigger Button - OTA Style */}
      <div
        onClick={openModal}
      >
        <div className="w-full sm:w-auto sm:flex-[0.7]">
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-tripswift-blue/10 transition-colors duration-300">
                <Users className="h-4 w-4 text-tripswift-black/40 group-hover:text-tripswift-blue transition-colors duration-200" />
              </div>
            </div>
            <div className="bg-white border border-tripswift-black/10 hover:border-tripswift-blue/20 rounded-md shadow-sm transition-all duration-200 h-11 pl-12 flex items-center">
              <span className="text-tripswift-black/70 text-sm font-tripswift-medium">
                {displayText || "1 Room · 1 Adult · 0 Children"}
              </span>
            </div>
          </div>
        </div>

        {/* Indicator for custom selection */}
        {/* {(rooms > 1 || guests > 1 || children > 0) && (
          <div className="w-2 h-2 bg-tripswift-blue rounded-full mr-2"></div>
        )} */}
      </div>

      {/* Render the modal using a portal */}
      {modalOpen && createPortal(modalContent, document.body)}
    </div>
  );
};
export default GuestBox;