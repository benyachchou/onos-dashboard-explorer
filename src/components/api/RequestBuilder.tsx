
import React, { useState, useEffect } from 'react';
import { ApiRequest } from './PostmanInterface';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, X, Send, Save } from 'lucide-react';

interface RequestBuilderProps {
  request: ApiRequest;
  onSave: (request: ApiRequest) => void;
  onExecute: (request: ApiRequest) => void;
  loading: boolean;
}

export const RequestBuilder: React.FC<RequestBuilderProps> = ({
  request,
  onSave,
  onExecute,
  loading
}) => {
  const [localRequest, setLocalRequest] = useState<ApiRequest>(request);

  useEffect(() => {
    setLocalRequest(request);
  }, [request]);

  const updateRequest = (updates: Partial<ApiRequest>) => {
    const updated = { ...localRequest, ...updates };
    setLocalRequest(updated);
    onSave(updated);
  };

  const addHeader = () => {
    const headers = { ...localRequest.headers, '': '' };
    updateRequest({ headers });
  };

  const updateHeader = (oldKey: string, newKey: string, value: string) => {
    const headers = { ...localRequest.headers };
    if (oldKey !== newKey && oldKey !== '') {
      delete headers[oldKey];
    }
    if (newKey) {
      headers[newKey] = value;
    }
    updateRequest({ headers });
  };

  const removeHeader = (key: string) => {
    const headers = { ...localRequest.headers };
    delete headers[key];
    updateRequest({ headers });
  };

  const addParam = () => {
    const params = { ...localRequest.params, '': '' };
    updateRequest({ params });
  };

  const updateParam = (oldKey: string, newKey: string, value: string) => {
    const params = { ...localRequest.params };
    if (oldKey !== newKey && oldKey !== '') {
      delete params[oldKey];
    }
    if (newKey) {
      params[newKey] = value;
    }
    updateRequest({ params });
  };

  const removeParam = (key: string) => {
    const params = { ...localRequest.params };
    delete params[key];
    updateRequest({ params });
  };

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la requête
          </label>
          <Input
            value={localRequest.name}
            onChange={(e) => updateRequest({ name: e.target.value })}
            placeholder="Nom de la requête"
          />
        </div>

        <div className="flex space-x-2">
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode
            </label>
            <select
              value={localRequest.method}
              onChange={(e) => updateRequest({ method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {methods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL
            </label>
            <Input
              value={localRequest.url}
              onChange={(e) => updateRequest({ url: e.target.value })}
              placeholder="http://192.168.94.129:8181/onos/v1/"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="params" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>

        <TabsContent value="params" className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Query Parameters</span>
            <Button onClick={addParam} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
          {Object.entries(localRequest.params || {}).map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <Input
                placeholder="Key"
                value={key}
                onChange={(e) => updateParam(key, e.target.value, value)}
              />
              <Input
                placeholder="Value"
                value={value}
                onChange={(e) => updateParam(key, key, e.target.value)}
              />
              <Button
                onClick={() => removeParam(key)}
                size="sm"
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="headers" className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Headers</span>
            <Button onClick={addHeader} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
          {Object.entries(localRequest.headers).map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <Input
                placeholder="Header"
                value={key}
                onChange={(e) => updateHeader(key, e.target.value, value)}
              />
              <Input
                placeholder="Value"
                value={value}
                onChange={(e) => updateHeader(key, key, e.target.value)}
              />
              <Button
                onClick={() => removeHeader(key)}
                size="sm"
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="body">
          <div className="space-y-2">
            <span className="text-sm font-medium">Request Body (JSON)</span>
            <Textarea
              value={localRequest.body || ''}
              onChange={(e) => updateRequest({ body: e.target.value })}
              placeholder='{"key": "value"}'
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-2 pt-4">
        <Button
          onClick={() => onExecute(localRequest)}
          disabled={loading}
          className="flex-1"
        >
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Envoi...' : 'Envoyer'}
        </Button>
        <Button
          onClick={() => onSave(localRequest)}
          variant="outline"
        >
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
};
