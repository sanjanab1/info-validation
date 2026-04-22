import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function LoginPage() {
  const [pid, setPid] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pid.trim()) {
      setError('Please enter your PID');
      return;
    }

    const pidNum = parseInt(pid, 10);
    if (isNaN(pidNum)) {
      setError('PID must be a number');
      return;
    }

    if (pidNum === 1) {
      navigate('/v1', { state: { pid: pidNum } });
    } else if (pidNum === 2) {
      navigate('/v2', { state: { pid: pidNum } });
    } else if (pidNum === 3) {
      navigate('/v3', { state: { pid: pidNum } });
    } else if (pidNum === 4) {
      navigate('/v4', { state: { pid: pidNum } });
    } else if (pidNum === 5) {
      navigate('/v5', { state: { pid: pidNum } });
    } else if (pidNum === 6) {
      navigate('/v6', { state: { pid: pidNum } });
    } else {
      setError('PID error');
      return;
    }
  };

  return (
    <div className="size-full bg-gradient-to-b from-[#ffffff] to-[#fcfcfc] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Info Validation</CardTitle>
          <CardDescription>Enter your PID to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pid" className="text-sm font-medium text-gray-700">
                Participant ID (PID)
              </label>
              <Input
                id="pid"
                type="text"
                placeholder="Enter your PID"
                value={pid}
                onChange={(e) => setPid(e.target.value)}
                className="text-base"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
