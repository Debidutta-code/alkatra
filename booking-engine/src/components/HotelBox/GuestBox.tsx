"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "@/Redux/store";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice";
import { createPortal } from "react-dom";
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
    setChildren((prevChildren) => {
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
    return childAges.every((age) => age > 0 && age < 14);
  };
  const handleApplyChanges = () => {
    if (children === 0 || isChildAgeValid()) {
      setDisplayText(
        `${rooms} ${rooms === 1 ? "Room" : "Rooms"} ${guests} ${
          guests === 1 ? "Guest" : "Guests"
        }`
      );
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
                Guests
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
                    onClick={() => incDecHandler(setChildren, -1, 0)}
                    disabled={children <= 0}
                  >
                    <span className="text-lg">-</span>
                  </button>
                  <span className="w-8 text-center text-tripswift-black font-tripswift-medium">
                    {children}
                  </span>
                  <button
                    className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10"
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
                        className="w-24 p-2 border border-tripswift-black/20 rounded-lg bg-tripswift-off-white focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue outline-none text-sm text-tripswift-black font-tripswift-medium"
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
      {/* Trigger Button */}
      <div
        className="w-full px-3 py-2.5 flex items-center cursor-pointer transition-colors"
        onClick={openModal}
      >
        <div className="flex items-center space-x-2.5">
          <span className="text-tripswift-black/70 text-sm font-tripswift-medium">
            {displayText || "Select guests"}
          </span>
        </div>
      </div>
      {/* Render the modal using a portal */}
      {modalOpen && createPortal(modalContent, document.body)}
    </div>
  );
};
export default GuestBox;
