
import React, { useState } from 'react';
import { onosApi } from '@/services/onosApi';
import { HttpMethod } from '@/types/onos';
import { Code, Play, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ApiExplorer: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [endpoint, setEndpoint] = useState('/devices');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const endpoints = [
    '/devices',
    '/devices/{deviceId}',
    '/links',
    '/hosts',
    '/flows',
    '/flows/{deviceId}',
    '/topology'
  ];

  const executeRequest = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (endpoint.includes('{deviceId}')) {
        params.deviceId = 'of:0000000000000001'; // Default device ID
      }

      let body;
      if (['POST', 'PUT'].includes(method) && requestBody) {
        body = JSON.parse(requestBody);
      }

      const result = await onosApi.customRequest(method, endpoint, body, params);
      setResponse(result);
      
      if (result.success) {
        toast({
          title: "Requête réussie",
          description: "La requête API a été exécutée avec succès",
        });
      } else {
        toast({
          title: "Erreur de requête",
          description: result.error || "Une erreur s'est produite",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Format JSON invalide ou erreur de requête",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const generatePythonCode = () => {
    const url = `http://192.168.94.129:8181/onos/v1${endpoint.replace('{deviceId}', 'DEVICE_ID')}`;
    let code = `import requests\n\n`;
    code += `url = "${url}"\n`;
    code += `headers = {'Accept': 'application/json'}\n`;
    code += `auth = ('onos', 'rocks')\n\n`;
    
    if (['POST', 'PUT'].includes(method)) {
      code += `data = ${requestBody || '{}'}\n`;
      code += `response = requests.${method.toLowerCase()}(url, json=data, headers=headers, auth=auth)\n`;
    } else {
      code += `response = requests.${method.toLowerCase()}(url, headers=headers, auth=auth)\n`;
    }
    
    code += `print(response.json())`;
    return code;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Explorateur d'API ONOS</h2>
        <Code className="w-6 h-6 text-gray-500" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode HTTP
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endpoint
            </label>
            <select
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {endpoints.map((ep) => (
                <option key={ep} value={ep}>{ep}</option>
              ))}
            </select>
          </div>
        </div>

        {['POST', 'PUT'].includes(method) && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Corps de la requête (JSON)
            </label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder='{"priority": 40000, "deviceId": "of:0000000000000001"}'
            />
          </div>
        )}

        <button
          onClick={executeRequest}
          disabled={loading}
          className="w-full md:w-auto px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>{loading ? 'Exécution...' : 'Exécuter la requête'}</span>
        </button>

        {response && (
          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Réponse JSON</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(response, null, 2))}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Code Python équivalent</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(generatePythonCode())}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border">
                {generatePythonCode()}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
