export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-primary"></div>
        <p className="text-text-secondary font-inter">Loading courses...</p>
      </div>
    </div>
  );
}
