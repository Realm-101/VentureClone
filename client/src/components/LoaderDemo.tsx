import { QuantumPulseLoader } from './quantum-pulse-loade';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function LoaderDemo() {
  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-3xl font-bold">Loader Demos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Quantum Pulse Loader - "Analyzing"</CardTitle>
        </CardHeader>
        <CardContent>
          <QuantumPulseLoader text="Analyzing" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quantum Pulse Loader - "Loading"</CardTitle>
        </CardHeader>
        <CardContent>
          <QuantumPulseLoader text="Loading" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quantum Pulse Loader - "Processing"</CardTitle>
        </CardHeader>
        <CardContent>
          <QuantumPulseLoader text="Processing" />
        </CardContent>
      </Card>
    </div>
  );
}
