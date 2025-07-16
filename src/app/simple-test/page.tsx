import SimpleImageGenerator from '@/components/dashboard/SimpleImageGenerator'

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Simple Image Generator Test</h1>
        <SimpleImageGenerator />
      </div>
    </div>
  )
} 