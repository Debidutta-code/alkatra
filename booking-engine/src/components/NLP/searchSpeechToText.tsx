"use client";
import React, { useEffect, useState, useCallback } from "react";
import { CiMicrophoneOn } from "react-icons/ci";

interface SpeechToTextProps {
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

export function SpeechToText({
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
}: SpeechToTextProps) {
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
                resetTranscript();
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
            const headers = {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            };

            const fetchCompletion = async (content: string, message: string) => {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo",
                        messages: [
                            {
                                role: "user",
                                content: transcript + message,
                            },
                        ],
                    }),
                });
            
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API Error: ${errorData.error.message}`);
                }
            
                const data = await response.json();
                return data.choices[0]?.message?.content || "null"; 
            };
            

            const startingDate = await fetchCompletion(
                transcript,
                " Extract only the starting date from the provided content. If the user specifies a duration like '2 days' or '3 days', set the starting date to today. If no starting date is found in content and no duration is specified, provide only a single word null. Do not provide any additional information or results. Ensure the date format is in numbers and not in words like (01-jan-2024).Always provide data only date format do not want any text included with date either date or null"
            );

            const endingDate = await fetchCompletion(
                transcript,
                " Extract only the ending date from the provided content. If the user specifies a duration like '2 days' or '3 days', set the ending date to the specified number of days in the future. If no ending date is found in content and no duration is specified, provide only a single word null. Do not provide any additional information or results. Ensure the date format like (DD-MM-YYYY).Always provide data only date format do not want any text included with date either date or null"
            );

            const persons = await fetchCompletion(
                transcript,
                " Extract the persons from the text, output should be only one number. If no persons are found, provide the number '0'. Do not provide any additional information or results."
            );

            const location = await fetchCompletion(
                transcript,
                " Extract only location name from the text. Do not provide any additional information or results. If no location is found in content, provide a single word null. Do not provide any additional information or results."
            );

            const childCount = await fetchCompletion(
                transcript,
                " Please extract the number of childs from the text. If no childs are found, provide the number '0'. Do not provide any additional information or results."
            );

            const adultCount = await fetchCompletion(
                transcript,
                " Please extract the number of adults from the text. If no adults are found, provide the number '0'. Do not provide any additional information or results."
            );

            setJsonStoredData({
                StartingDate: startingDate,
                EndingDate: endingDate,
                Persons: persons,
                Location: location,
                ChildCount: childCount,
                AdultCount: adultCount,
                Transcript: transcript,
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
                    {isListening ? "Listening... Click again to stop." : "Speak to Search"}
                </div>
            </div>
        </>
    );
}
