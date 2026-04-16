 "use client";
 
 interface CloudStatusIndicatorProps {
   statusDotClass: string;
 }
 
 export default function CloudStatusIndicator({ statusDotClass }: CloudStatusIndicatorProps) {
   return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] transform rounded-md">
       <span className="inline-flex items-center gap-2">
         <span className={`h-2 w-2 rounded-full ${statusDotClass}`} />
       </span>
     </div>
   );
 }
