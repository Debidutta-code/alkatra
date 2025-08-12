// "use client";
// import React, { useEffect, useState, useMemo } from "react";
// import { OpenAI } from "openai";
// import { CiMicrophoneOn } from "react-icons/ci";

// interface FormSpeechToTextProps {
//     apiKey: string;
//     SpeechRecognition: any;
//     resetTranscript: () => void;
//     browserSupportsSpeechRecognition: boolean;
//     transcript: string;
//     setJsonStoredData: (data: any) => void;
//     mic_color?: string;
//     mic_bg_color?: string;
//     listening: boolean;
//     setText: (text: string) => void;
//     text: string;
// }

// export function FormSpeechToText({
//     text,
//     setText,
//     listening,
//     apiKey,
//     mic_bg_color,
//     SpeechRecognition,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//     transcript,
//     setJsonStoredData,
//     mic_color,
// }: FormSpeechToTextProps) {
//     const [isListening, setIsListening] = useState<boolean>(false);
//     const openai = useMemo(() => {
//         return new OpenAI({
//             apiKey: apiKey,
//             dangerouslyAllowBrowser: true,
//         });
//     }, [apiKey]);

//     const handleMicClick = () => {
//         setIsListening((prevState) => !prevState);
//     };

//     useEffect(() => {
//         if (isListening) {
//             SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
//         } else {
//             SpeechRecognition.stopListening();
//             if (text.trim() !== "") {
//                 fetchData(text);
//                 resetTranscript(); // Reset the transcript after fetching data
//             }
//         }
//     }, [isListening]);

//     useEffect(() => {
//         setText(transcript);
//     }, [transcript]);

//     useEffect(() => {
//         if (!listening) {
//             setIsListening(false);
//         }
//     }, [listening]);

//     const fetchData = async (transcript: string) => {
//         try {
//             // Extract name
//             const nameCompletion = await openai.chat.completions.create({
//                 messages: [
//                     {
//                         role: "user",
//                         content:
//                             transcript +
//                             "Extract the name of the person from the text. If no name is found, provide the word 'null'. Do not provide any additional information or results.",
//                     },
//                 ],
//                 model: "gpt-3.5-turbo",
//             });
//             const name = nameCompletion.choices[0].message.content;

//             // Extract email address
//             const emailCompletion = await openai.chat.completions.create({
//                 messages: [
//                     {
//                         role: "user",
//                         content:
//                             transcript +
//                             "Extract the email address from the text. If no email is found, provide the word 'null'. Do not provide any additional information or results.",
//                     },
//                 ],
//                 model: "gpt-3.5-turbo",
//             });
//             const email = emailCompletion.choices[0].message.content;

//             // Extract phone number
//             const phoneCompletion = await openai.chat.completions.create({
//                 messages: [
//                     {
//                         role: "user",
//                         content:
//                             transcript +
//                             "Extract the phone number from the text. If no phone number is found, provide the word 'null'. Do not provide any additional information or results.",
//                     },
//                 ],
//                 model: "gpt-3.5-turbo",
//             });
//             const phone = phoneCompletion.choices[0].message.content;

//             // Extract additional details (e.g., address, date of birth)
//             const additionalDetailsCompletion = await openai.chat.completions.create({
//                 messages: [
//                     {
//                         role: "user",
//                         content:
//                             transcript +
//                             "Extract any additional details such as address or date of birth from the text. If no additional details are mentioned, provide the word 'null'. Do not provide any additional information or results.",
//                     },
//                 ],
//                 model: "gpt-3.5-turbo",
//             });
//             const additionalDetails = additionalDetailsCompletion.choices[0].message.content;

//             setJsonStoredData({
//                 Name: name,
//                 Email: email,
//                 Phone: phone,
//                 AdditionalDetails: additionalDetails,
//                 Transcript: transcript,
//             });
//         } catch (error) {
//             console.error("Error fetching data: ", error);
//         }
//     };

//     return (
// <>
//     <style jsx>{`
//         .mic-container {
//             position: relative;
//             display: inline-block;
//             width: 150px;
//             height: 150px;
//             text-align: center;
//         }
//         .mic-button {
//             position: absolute;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%);
//             overflow: hidden;
//             transition: all 0.3s ease;
//             width: 50px;
//             height: 50px;
//             z-index: 2;
//             cursor: pointer;
//         }
//         .mic-button:hover {
//             transform: translate(-50%, -50%) scale(1.1);
//         }
//         .wave {
//             position: absolute;
//             border: 2px solid gray;
//             width: 100%;
//             height: 100%;
//             opacity: 0;
//             border-radius: 50%;
//             top: 50%;
//             left: 50%;
//             transform: translate(-50%, -50%) scale(0.1);
//         }
//         .listening .wave {
//             animation: wave 2s linear infinite;
//         }
//         @keyframes wave {
//             0% {
//                 transform: translate(-50%, -50%) scale(0.1);
//                 opacity: 0;
//             }
//             50% {
//                 opacity: 1;
//             }
//             100% {
//                 transform: translate(-50%, -50%) scale(1);
//                 opacity: 0;
//             }
//         }
//         .prompt {
//             margin-top: 100px;
//             font-size: 16px;
//             color: red;
//         }
//     `}</style>

//     <div className="mic-container" style={{ fontFamily: "serif" }}>
//         <button
//             onClick={handleMicClick}
//             className={`mic-button text-xl text-black rounded-md flex items-center justify-center ${
//                 isListening ? "listening" : ""
//             }`}
//         >
//             <CiMicrophoneOn size={44} />
//             <div className="wave"></div>
//             <div className="wave" style={{ animationDelay: '0.5s' }}></div>
//             <div className="wave" style={{ animationDelay: '1s' }}></div>
//         </button>
//         <div className="prompt">
//             {isListening ? "Listening... Click again to stop." : "Speak your details"}
//         </div>
//     </div>
// </>
//     );
// }
