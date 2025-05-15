"use client";
import React, { useEffect, useState } from "react";
import { CiMicrophoneOn } from "react-icons/ci";

interface PropertySpeechToTextProps {
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

export function PropertySpeechToText({
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
}: PropertySpeechToTextProps) {
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
            // Extract star rating
            const ratingResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: `${transcript} Extract the star rating of the property. If no rating is mentioned, provide the number 'null'. Do not provide any additional information or results.`,
                        },
                    ],
                }),
            });
            const ratingData = await ratingResponse.json();
            const rating = ratingData.choices[0].message.content;

            // Extract property name
            const propertyNameResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: `${transcript} Extract the name of the property from the text. If no property name is found, provide the word 'null'. Do not provide any additional information or results.`,
                        },
                    ],
                }),
            });
            const propertyNameData = await propertyNameResponse.json();
            const propertyName = propertyNameData.choices[0].message.content;

            // Extract amenities
            const amenitiesResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: `${transcript} Extract the amenities mentioned in the text. List all amenities such as swimming pool, gym, etc. If no amenities are mentioned, provide the word 'null'. Do not provide any additional information or results.`,
                        },
                    ],
                }),
            });
            const amenitiesData = await amenitiesResponse.json();
            const amenities = amenitiesData.choices[0].message.content;

            setJsonStoredData({
                Rating: rating,
                PropertyName: propertyName,
                Amenities: amenities,
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
                    <div className="wave" style={{ animationDelay: '0.5s' }}></div>
                    <div className="wave" style={{ animationDelay: '1s' }}></div>
                </button>
                <div className="prompt">
                    {isListening ? "Listening... Click again to stop." : "Speak about property details"}
                </div>
            </div>
        </>
    );
}
