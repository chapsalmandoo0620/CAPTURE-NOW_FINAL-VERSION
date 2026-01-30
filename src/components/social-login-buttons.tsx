'use client';

import React from 'react';

interface SocialButtonProps {
    onClick: () => void;
}

export const GoogleSignInButton = ({ onClick }: SocialButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="w-full relative flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-all rounded px-3 py-2.5 h-[44px]"
            // Mimicking .gsi-material-button style
            style={{
                fontFamily: "'Roboto', arial, sans-serif",
            }}
        >
            <div className="absolute left-3 w-5 h-5 flex items-center justify-center">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="block w-full h-full">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
            </div>
            <span className="text-gray-600 font-medium text-sm">Sign in with Google</span>
        </button>
    );
};

export const KakaoSignInButton = ({ onClick }: SocialButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="w-full relative flex items-center justify-center bg-[#FEE500] hover:bg-[#FDD835] border border-[#FEE500] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#FEE500] transition-all rounded px-3 py-2.5 h-[44px]"
            style={{
                fontFamily: "sans-serif", // Kakao often uses system font or specific KR font
            }}
        >
            <div className="absolute left-3 w-5 h-5 flex items-center justify-center">
                {/* Kakao Icon (Speech Bubble) */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-black">
                    <path d="M12 3C7.58 3 4 5.79 4 9.24C4 11.28 5.39 13.09 7.53 14.22C7.38 14.75 7.05 16.03 6.96 16.34C6.91 16.53 7.12 16.63 7.25 16.54C7.8 16.14 10.02 14.63 10.37 14.39C10.9 14.45 11.44 14.48 12 14.48C16.42 14.48 20 11.69 20 8.24C20 4.79 16.42 2 12 2V3Z" transform="scale(1 1) translate(0 0)" />
                    {/* Simple Path approximation for Kakao Talk Icon */}
                    <path d="M12 2C6.48 2 2 5.58 2 10C2 12.03 3.01 13.84 4.67 15.18C4.54 15.68 4.13 17.51 4 18C3.95 18.25 4.22 18.39 4.41 18.26C5.22 17.67 8.32 15.49 8.84 15.13C9.84 15.24 10.89 15.3 12 15.3C17.52 15.3 22 11.72 22 7.3C22 2.88 17.52 2 12 2Z" />
                </svg>
            </div>
            <span className="text-black font-medium text-sm text-opacity-85">Sign in with Kakao</span>
        </button>
    );
};
