"use client";
import React, { useEffect, useState, useMemo } from "react";
import { OpenAI } from "openai";
import { CiMicrophoneOn } from "react-icons/ci";

interface ShowSpeechToTextProps {
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
    onShowBooking: (details: any) => void; // Function to handle showing booking details
}

export function ShowSpeechToText({
    text,
    setText,
    listening,
    apiKey,
    SpeechRecognition,
    resetTranscript,
    transcript,
    setJsonStoredData,
    mic_color,
    mic_bg_color,
    onShowBooking,
}: ShowSpeechToTextProps) {
    const [isListening, setIsListening] = useState<boolean>(false);
    const openai = useMemo(() => new OpenAI({ apiKey }), [apiKey]);

    const handleMicClick = () => setIsListening((prev) => !prev);

    useEffect(() => {
        if (isListening) {
            SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
        } else {
            SpeechRecognition.stopListening();
            if (text.trim()) {
                processCommand(text);
                resetTranscript(); // Reset transcript after processing
            }
        }
    }, [isListening]);

    useEffect(() => {
        setText(transcript);
    }, [transcript]);

    useEffect(() => {
        if (!listening) setIsListening(false);
    }, [listening]);

    const processCommand = async (command: string) => {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: `
                            ${command}
                            Determine if the user wants to view their booking details.
                            Respond with 'show' if they want to see their booking, or 'unknown' if not.
                        `,
                    },
                ],
            });

            // Check if choices is not empty and has at least one element
            if (response.choices && response.choices.length > 0) {
                const result = response.choices[0].message?.content?.trim().toLowerCase() || "unknown";

                if (result === "show") {
                    onShowBooking({ message: command });
                } else {
                    console.warn("Command not recognized for showing booking.");
                }
            } else {
                console.warn("No choices returned from OpenAI.");
            }
        } catch (error) {
            console.error("Error processing command:", error);
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
                    <CiMicrophoneOn size={44} color={mic_color || "black"} style={{ backgroundColor: mic_bg_color || "white" }} />
                    <div className="wave"></div>
                    <div className="wave" style={{ animationDelay: '0.5s' }}></div>
                    <div className="wave" style={{ animationDelay: '1s' }}></div>
                </button>
                <div className="prompt">
                    {isListening ? "Listening... Click again to stop." : "Speak to view your booking details"}
                </div>
            </div>
        </>
    );
}
