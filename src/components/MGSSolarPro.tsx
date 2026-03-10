import React from 'react';

export function MGSSolarPro() {
  return (
    <div className="w-full h-[calc(100vh-140px)] bg-white">
      <iframe 
        src="https://mg-s-solar-pro.vercel.app/" 
        className="w-full h-full border-0"
        title="MGS Solar Pro"
        allow="clipboard-read; clipboard-write; camera; microphone"
      />
    </div>
  );
}
