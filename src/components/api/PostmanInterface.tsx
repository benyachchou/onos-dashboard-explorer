import React, { useState } from 'react';
import { RequestBuilder } from './RequestBuilder';
import { ResponseViewer } from './ResponseViewer';
import { CollectionManager } from './CollectionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Send, Archive } from 'lucide-react';

export interface ApiRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  params?: Record<string, string>;
}

export interface ApiCollection {
  id: string;
  name: string;
  requests: ApiRequest[];
}

export const PostmanInterface: React.FC = () => {
  const [activeRequest, setActiveRequest] = useState<ApiRequest | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(false);

  const createNewRequest = (): ApiRequest => ({
    id: Date.now().toString(),
    name: 'Nouvelle Requête',
    method: 'GET',
    url: 'http://192.168.94.129:8181/onos/v1/',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  const handleNewRequest = () => {
    const newRequest = createNewRequest();
    setActiveRequest(newRequest);
    setResponse(null);
  };

  const handleSaveRequest = (request: ApiRequest) => {
    setActiveRequest(request);
    // Auto-save to a default collection if needed
  };

  const handleExecuteRequest = async (request: ApiRequest) => {
    setLoading(true);
    try {
      const url = new URL(request.url);
      
      // Add query parameters
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          if (value) url.searchParams.append(key, value);
        });
      }

      const options: RequestInit = {
        method: request.method,
        headers: {
          ...request.headers,
          'Authorization': 'Basic ' + btoa('onos:rocks')
        }
      };

      if (request.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        options.body = request.body;
      }

      const startTime = Date.now();
      const response = await fetch(url.toString(), options);
      const endTime = Date.now();
      
      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: await response.text(),
        time: endTime - startTime,
        size: response.headers.get('content-length') || 'Unknown'
      };

      try {
        responseData.data = JSON.parse(responseData.data);
      } catch (e) {
        // Keep as text if not JSON
      }

      setResponse(responseData);
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: error.message },
        time: 0,
        size: '0'
      });
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">API Testing Platform</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleNewRequest}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Nouvelle Requête</span>
          </button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder" className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Request Builder</span>
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center space-x-2">
            <Archive className="w-4 h-4" />
            <span>Collections</span>
          </TabsTrigger>
          <TabsTrigger value="response" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Response</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <RequestBuilder
              request={activeRequest || createNewRequest()}
              onSave={handleSaveRequest}
              onExecute={handleExecuteRequest}
              loading={loading}
            />
            <ResponseViewer response={response} loading={loading} />
          </div>
        </TabsContent>

        <TabsContent value="collections" className="flex-1">
          <CollectionManager
            collections={collections}
            onCollectionsChange={setCollections}
            onRequestSelect={setActiveRequest}
            activeRequest={activeRequest}
          />
        </TabsContent>

        <TabsContent value="response" className="flex-1">
          <ResponseViewer response={response} loading={loading} fullView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
