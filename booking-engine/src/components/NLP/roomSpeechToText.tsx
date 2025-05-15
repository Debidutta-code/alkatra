"use client";
import React, { useEffect, useState } from "react";
import { CiMicrophoneOn } from "react-icons/ci";
import stringSimilarity from "string-similarity";

interface RoomSpeechToTextProps {
    apiKey: string;
    SpeechRecognition: any;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    transcript: string;
    setJsonStoredData: (data: any) => void;
    mic_color?: string;
    mic_bg_color?: string;
    listening: boolean;
    setText: (text: string) => void;
    text: string;
}

const validRoomNames = [
    "Deluxe Room",
    "Suite",
    "Single Room",
    "Double Room",
    "Family Room",
    "Executive Room",
    // Add more room names as needed
];

export function RoomSpeechToText({
    text,
    setText,
    listening,
    apiKey,
    mic_bg_color,
    SpeechRecognition,
    resetTranscript,
    browserSupportsSpeechRecognition,
    transcript,
    setJsonStoredData,
    mic_color,
}: RoomSpeechToTextProps) {
    const [isListening, setIsListening] = useState<boolean>(false);

    const handleMicClick = () => {
        setIsListening((prevState) => !prevState);
    };

    useEffect(() => {
        if (isListening) {
            SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
        } else {
            SpeechRecognition.stopListening();
            if (text.trim() !== "") {
                fetchData(text);
                resetTranscript(); // Reset the transcript after fetching data
            }
        }
    }, [isListening]);

    useEffect(() => {
        setText(transcript);
    }, [transcript]);

    useEffect(() => {
        if (!listening) {
            setIsListening(false);
        }
    }, [listening]);

    const fetchData = async (transcript: string) => {
        try {
            const fetchOpenAI = async (message: string) => {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [{ role: "user", content: message }],
                    }),
                });
                const data = await response.json();
                return data.choices?.[0]?.message?.content?.trim();
            };

            // Extract room name
            let roomName = await fetchOpenAI(
                transcript + " Extract the name of the room. If no name is provided, do not include this information."
            );

            // Fuzzy matching to correct minor spelling errors
            if (roomName) {
                const bestMatch = stringSimilarity.findBestMatch(roomName, validRoomNames);
                roomName = bestMatch.bestMatch.rating > 0.7 ? bestMatch.bestMatch.target : roomName;
            }

            // Extract room type
            const roomType = await fetchOpenAI(
                transcript + " Extract the type of room requested, such as 'single', 'double', 'suite', etc."
            );

            // Extract capacity
            const capacity = await fetchOpenAI(
                transcript + " Extract the capacity of the room, i.e., how many people it should accommodate."
            );

            // Extract amenities
            const amenities = await fetchOpenAI(
                transcript + " Extract any specific amenities requested for the room."
            );

            // Extract special features
            const features = await fetchOpenAI(
                transcript + " Extract any special features or additional requests for the room."
            );

            // Extract price range
            const priceRange = await fetchOpenAI(
                transcript + " Extract the price range. Provide the minimum and maximum price."
            );

            const extractedData: any = {};

            if (roomName && roomName.toLowerCase() !== "null") {
                extractedData.RoomName = roomName;
            }

            if (roomType && roomType.toLowerCase() !== "null") {
                extractedData.RoomType = roomType;
            }

            if (capacity && capacity.toLowerCase() !== "null") {
                extractedData.Capacity = capacity;
            }

            if (amenities && amenities.toLowerCase() !== "null") {
                extractedData.Amenities = amenities;
            }

            if (features && features.toLowerCase() !== "null") {
                extractedData.SpecialFeatures = features;
            }

            setJsonStoredData({
                ...extractedData,
                Transcript: transcript,
                priceRange: priceRange,
            });
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    return (
        <>
            <style jsx>{`
                .mic-container {
                    position: relative;
                    display: inline-block;
                    width: 150px;
                    height: 150px;
                    text-align: center;
                }
                .mic-button {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    width: 50px;
                    height: 50px;
                    z-index: 2;
                    cursor: pointer;
                }
                .mic-button:hover {
                    transform: translate(-50%, -50%) scale(1.1);
                }
                .wave {
                    position: absolute;
                    border: 2px solid gray;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.1);
                }
                .listening .wave {
                    animation: wave 2s linear infinite;
                }
                @keyframes wave {
                    0% {
                        transform: translate(-50%, -50%) scale(0.1);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0;
                    }
                }
                .prompt {
                    margin-top: 100px;
                    font-size: 16px;
                    color: red;
                }
            `}</style>

            <div className="mic-container" style={{ fontFamily: "serif" }}>
                <button
                    onClick={handleMicClick}
                    className={`mic-button text-xl text-black rounded-md flex items-center justify-center ${
                        isListening ? "listening" : ""
                    }`}
                >
                    <CiMicrophoneOn size={44} />
                    <div className="wave"></div>
                    <div className="wave" style={{ animationDelay: "0.5s" }}></div>
                    <div className="wave" style={{ animationDelay: "1s" }}></div>
                </button>
                <div className="prompt">
                    {isListening ? "Listening... Click again to stop." : "Speak about room details"}
                </div>
            </div>
        </>
    );
}
