"use client";

export default function ModuleWrapper({children}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-black relative w-full">
      {children}
    </div>
  );
}

