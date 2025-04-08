"use client";

import { SimpleButton } from "@/components/SimpleButton";
import { useState } from "react";

export default function TestPage() {
  const [count, setCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Button Test Page</h1>

      <div className="p-4 border rounded">
        <h2 className="text-xl mb-4">Counter Test</h2>
        <p className="mb-4">Count: {count}</p>
        <SimpleButton onClick={() => setCount(count + 1)}>Increment</SimpleButton>
      </div>

      <div className="p-4 border rounded">
        <h2 className="text-xl mb-4">Show/Hide Test</h2>
        <SimpleButton onClick={() => setShowMessage(!showMessage)}>
          {showMessage ? "Hide Message" : "Show Message"}
        </SimpleButton>

        {showMessage && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            This is a test message!
          </div>
        )}
      </div>

      <div className="p-4 border rounded">
        <h2 className="text-xl mb-4">Alert Test</h2>
        <SimpleButton onClick={() => alert("Button clicked!")}>
          Show Alert
        </SimpleButton>
      </div>
    </div>
  );
}
