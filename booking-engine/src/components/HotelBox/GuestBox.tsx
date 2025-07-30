"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "@/Redux/store";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice";
import { createPortal } from "react-dom";
import { ChevronDown, Users } from "lucide-react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

// Define props interface
interface GuestBoxProps {
  onChange?: (guestDetails: {
    rooms: number;
    guests: number;
    children: number;
    childAges: number[];
    infants: number;
    infantAges: number[];
    childDOBs: string[];
    infantDOBs: string[];
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
  const [infants, setInfants] = useState(guestDetails?.infants || 0);
  const [infantAges, setInfantAges] = useState(guestDetails?.infantAges || Array.from({ length: 0 }, () => 0));
  const [displayText, setDisplayText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const updateDisplayText = () => {
    const roomsToUse = guestDetails?.rooms || 1;
    const guestsToUse = guestDetails?.guests || 1;
    const childrenToUse = guestDetails?.children || 0;
    const infantsToUse = guestDetails?.infants || 0;

    let text = `${roomsToUse} ${roomsToUse === 1 ? t("GuestBox.roomSingular") : t("GuestBox.roomsPlural")} · ${guestsToUse} ${guestsToUse === 1 ? t("GuestBox.adultSingular") : t("GuestBox.adultsPlural")}`;
  
    if (childrenToUse > 0) {
      text += ` · ${childrenToUse} ${childrenToUse === 1 ? t("GuestBox.childSingular") : t("GuestBox.childrenPlural")}`;
    }
    
    if (infantsToUse > 0) {
      text += ` · ${infantsToUse} ${infantsToUse === 1 ? t("GuestBox.infantSingular") : t("GuestBox.infantsPlural")}`;
    }
  
    setDisplayText(text);
  };
  useEffect(() => {
    updateDisplayText();
  }, [guestDetails, t]);

  useEffect(() => {
    if (guestDetails) {
      setRooms(guestDetails.rooms || 1);
      setGuests(guestDetails.guests || 1);
      setChildren(guestDetails.children || 0);
      setChildAges(guestDetails.childAges || []);
      setInfants(guestDetails.infants || 0);
      setInfantAges(guestDetails.infantAges || []);
    }
  }, [guestDetails, t]);
  
  useEffect(() => {
    updateDisplayText();
  }, []);

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
    minValue: number = 1,
    maxValue?: number
  ) => {
    setter((prevValue) => {
      const updatedValue = prevValue + delta;
      if (updatedValue < minValue) return minValue;
      if (maxValue !== undefined && updatedValue > maxValue) return maxValue;
      return updatedValue;
    });
  };

  const handleChildrenChange = (value: number) => {
    setChildren(() => {
      const newValue = Math.max(value, 0);
      setChildAges((prevAges: number[]) => {
        if (newValue > prevAges.length) {
          return [...prevAges, ...Array.from({ length: newValue - prevAges.length }, () => 0)];
        } else {
          return prevAges.slice(0, newValue);
        }
      });
      return newValue;
    });
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const newChildAges = [...childAges];
    newChildAges[index] = age;
    setChildAges(newChildAges);
  };

  const handleInfantsChange = (value: number) => {
    setInfants(() => {
      const newValue = Math.max(value, 0);
      setInfantAges((prevAges: number[]) => {
        if (newValue > prevAges.length) {
          return [...prevAges, ...Array.from({ length: newValue - prevAges.length }, () => undefined)];
        } else {
          return prevAges.slice(0, newValue);
        }
      });
      return newValue;
    });
  };

  const handleInfantAgeChange = (index: number, age: number) => {
    const newInfantAges = [...infantAges];
    newInfantAges[index] = age;
    setInfantAges(newInfantAges);
  };

  const isChildAgeValid = () => {
    return childAges.every((age: number) => age > 0 && age < 14);
  };

  const isInfantAgeValid = () => {
    return infantAges.every((age: number) => age !== undefined && age >= 0 && age < 2);
  };

  const validateGuestCount = () => {
    const maxGuestsPerRoom = 4;
    const totalGuests = guests + children + infants;
    const maxAllowedGuests = rooms * maxGuestsPerRoom;
    if (totalGuests > maxAllowedGuests) {
      setError(t("GuestBox.maxGuestsError", { maxGuests: maxGuestsPerRoom }));
      return false;
    }
    return true;
  };

  const handleApplyChanges = () => {
    if (!validateGuestCount()) {
      return;
    }
    if ((children === 0 || isChildAgeValid()) && (infants === 0 || isInfantAgeValid())) {
      const guestData = {
        rooms,
        guests,
        children,
        childAges,
        infants,
        infantAges,
        childDOBs: childAges.map((age: number) => dayjs().subtract(age, 'year').format('YYYY-MM-DD')),
        infantDOBs: infantAges.map((age: number) => dayjs().subtract(age, 'year').format('YYYY-MM-DD'))
      };
      dispatch(setGuestDetails(guestData));
      if (onChange) {
        onChange(guestData);
      }
      closeModal();
    } else {
      setError(t("GuestBox.selectAgeError"));
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
              {t("GuestBox.selectGuests")}
            </h3>
            {/* Rooms Section */}
            <div className="flex items-center justify-between">
              <label className="text-tripswift-black font-tripswift-medium uppercase">
                {t("GuestBox.roomsPlural")}
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
                  className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => incDecHandler(setRooms, 1, 1, 4)}
                  disabled={rooms >= 4}
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>
            {/* Guests Section */}
            <div className="flex items-center  justify-between">
              <label className="text-tripswift-black font-tripswift-medium uppercase">
                {t("GuestBox.adultsPlural")}
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
                  className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => incDecHandler(setGuests, 1)}
                  disabled={(guests + children + infants) >= (rooms * 4)}
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
                  {t("GuestBox.childrenPlural")}{" "}
                  <span className="text-xs text-tripswift-black/60">
                    ({t("GuestBox.ages")} 2-12)
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
                    className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleChildrenChange(children + 1)}
                    disabled={(guests + children + infants) >= (rooms * 4)}
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>
              {/* Custom Child Age Selectors */}
              {children > 0 && (
                <div className="space-y-3 mt-4 pl-4">
                  {Array.from({ length: children }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <label className="text-tripswift-black/70 text-sm font-tripswift-medium">
                        {t("GuestBox.childSingular")} {index + 1} {t("GuestBox.age")}
                      </label>
                      <div className="relative w-30">
                        <select
                          value={childAges[index]}
                          onChange={(e) => handleChildAgeChange(index, parseInt(e.target.value))}
                          className="appearance-none w-full p-2 pr-8 border border-tripswift-black/20 rounded-lg bg-tripswift-off-white focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue outline-none text-sm text-tripswift-black font-tripswift-medium cursor-pointer"
                        >
                          <option value={0} disabled>{t("GuestBox.selectAge")}</option>
                          {Array.from({ length: 13 }, (_, i) => i)
                            .slice(2)
                            .map((age) => (
                              <option key={age} value={age}>
                                {age} {age === 1 ? t("GuestBox.yearSingular") : t("GuestBox.yearPlural")}
                              </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-tripswift-black/40" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Infants Section */}
            <div className="space-y-3 pt-2 border-t border-tripswift-black/10">
              <div className="flex items-center justify-between">
                <label
                  className="text-tripswift-black font-tripswift-medium uppercase"
                  htmlFor="modalInfants"
                >
                  {t("GuestBox.infantsPlural")}{" "}
                  <span className="text-xs text-tripswift-black/60">
                    ({t("GuestBox.ages")} 0-1)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50"
                    onClick={() => handleInfantsChange(infants - 1)}
                    disabled={infants <= 0}
                  >
                    <span className="text-lg">-</span>
                  </button>
                  <span className="w-8 text-center text-tripswift-black font-tripswift-medium">
                    {infants}
                  </span>
                  <button
                    className="w-9 h-9 rounded-full border border-tripswift-black/20 text-tripswift-black/60 flex items-center justify-center transition-colors hover:bg-tripswift-blue/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleInfantsChange(infants + 1)}
                    disabled={(guests + children + infants) >= (rooms * 4)}
                  >
                    <span className="text-lg">+</span>
                  </button>
                </div>
              </div>
              {/* Infant Age Selectors */}
              {infants > 0 && (
                <div className="space-y-3 mt-4 pl-4">
                  {Array.from({ length: infants }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <label className="text-tripswift-black/70 text-sm font-tripswift-medium">
                        {t("GuestBox.infantsPlural")} {index + 1} {t("GuestBox.age")}
                      </label>
                      <div className="relative w-30">
                        <select
                          value={infantAges[index] !== undefined ? infantAges[index] : ""}
                          onChange={(e) => handleInfantAgeChange(index, parseInt(e.target.value))}
                          className="appearance-none w-full p-2 pr-8 border border-tripswift-black/20 rounded-lg bg-tripswift-off-white focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue outline-none text-sm text-tripswift-black font-tripswift-medium cursor-pointer"
                        >
                          <option value="" disabled>{t("GuestBox.selectAge")}</option>
                          {[0, 1].map((age) => (
                            <option key={age} value={age}>
                              {age} {age === 1 ? t("GuestBox.yearSingular") : t("GuestBox.yearPlural")}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-tripswift-black/40" />
                        </div>
                      </div>
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
                {t("GuestBox.cancel")}
              </button>
              <button
                onClick={handleApplyChanges}
                className="btn-tripswift-primary px-6 py-2.5"
              >
                {t("GuestBox.apply")}
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
            <div className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-tripswift-blue/10 transition-colors duration-300">
                <Users className="h-4 w-4 text-tripswift-black/40 group-hover:text-tripswift-blue transition-colors duration-200" />
              </div>
            </div>
            <div className={`bg-white border border-tripswift-black/10 hover:border-tripswift-blue/20 rounded-md shadow-sm transition-all duration-200 h-11 ${i18n.language === "ar" ? "pr-12" : "pl-12"} flex items-center`}>
              <span className="text-tripswift-black/70 ml-3 mr-3 text-sm font-tripswift-medium">
                {displayText || t("GuestBox.defaultText")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Render the modal using a portal */}
      {modalOpen && createPortal(modalContent, document.body)}
    </div>
  );
};

export default GuestBox;