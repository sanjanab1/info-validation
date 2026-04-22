import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AVAILABLE_CONTENT_PACK_IDS, CONTENT_PACK_LABELS, DEFAULT_CONTENT_PACK_ID, resolveContentPackId } from '../llmContent';

export default function LoginPage() {
  const [pid, setPid] = useState('');
  const [error, setError] = useState('');
  const [contentPackId, setContentPackId] = useState(DEFAULT_CONTENT_PACK_ID);
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
      navigate('/v1', { state: { pid: pidNum, contentPackId: resolveContentPackId(contentPackId) } });
    } else if (pidNum === 2) {
      navigate('/v2', { state: { pid: pidNum, contentPackId: resolveContentPackId(contentPackId) } });
    } else if (pidNum === 3) {
      navigate('/v3', { state: { pid: pidNum, contentPackId: resolveContentPackId(contentPackId) } });
    } else if (pidNum === 4) {
      navigate('/v4', { state: { pid: pidNum, contentPackId: resolveContentPackId(contentPackId) } });
    } else if (pidNum === 5) {
      navigate('/v5', { state: { pid: pidNum, contentPackId: resolveContentPackId(contentPackId) } });
    } else if (pidNum === 6) {
      navigate('/v6', { state: { pid: pidNum, contentPackId: resolveContentPackId(contentPackId) } });
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
            <div className="space-y-2">
              <label htmlFor="contentPack" className="text-sm font-medium text-gray-700">
                Content pack
              </label>
              <select
                id="contentPack"
                value={contentPackId}
                onChange={(e) => setContentPackId(e.target.value as typeof contentPackId)}
                className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-base text-gray-900 outline-none transition-colors focus:border-gray-400"
              >
                {AVAILABLE_CONTENT_PACK_IDS.map((packId) => (
                  <option key={packId} value={packId}>
                    {CONTENT_PACK_LABELS[packId]}
                  </option>
                ))}
              </select>
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
