import UrlInputForm from "@/components/UrlInputForm";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900">
          Feedback Analysis Dashboard
        </h1>
        <p className="text-lg text-gray-500 max-w-lg">
          Paste a public Google Sheets URL to analyze sentiment and discover key
          themes in your feedback data.
        </p>
      </div>

      <UrlInputForm />

      <div className="text-center text-xs text-gray-400 max-w-md space-y-1">
        <p className="font-medium text-gray-500">How it works:</p>
        <ol className="list-decimal list-inside text-left space-y-1">
          <li>Open your Google Sheet and set sharing to &quot;Anyone with the link&quot;</li>
          <li>Copy the URL from your browser address bar</li>
          <li>Paste it above and click Analyze</li>
        </ol>
      </div>
    </div>
  );
}
