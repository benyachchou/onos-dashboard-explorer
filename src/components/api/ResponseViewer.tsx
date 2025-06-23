
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Download, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResponseViewerProps {
  response: any;
  loading: boolean;
  fullView?: boolean;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  loading,
  fullView = false
}) => {
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>('pretty');
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié!",
      description: "Le contenu a été copié dans le presse-papiers",
    });
  };

  const downloadResponse = () => {
    if (!response) return;
    
    const blob = new Blob([JSON.stringify(response.data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCurlCommand = () => {
    // This would generate a curl command based on the request
    return "curl -X GET 'http://192.168.94.129:8181/onos/v1/devices' -H 'Accept: application/json' -u 'onos:rocks'";
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${fullView ? 'h-full' : ''}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Envoi de la requête...</span>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${fullView ? 'h-full' : ''}`}>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <div className="text-center">
            <Eye className="w-8 h-8 mx-auto mb-2" />
            <p>Aucune réponse pour le moment</p>
            <p className="text-sm">Envoyez une requête pour voir la réponse</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50';
    if (status >= 500) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 space-y-4 ${fullView ? 'h-full flex flex-col' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Réponse</h3>
        <div className="flex space-x-2">
          <Button
            onClick={() => setViewMode(viewMode === 'pretty' ? 'raw' : 'pretty')}
            size="sm"
            variant="outline"
          >
            <Code className="w-4 h-4 mr-1" />
            {viewMode === 'pretty' ? 'Raw' : 'Pretty'}
          </Button>
          <Button
            onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
            size="sm"
            variant="outline"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copier
          </Button>
          <Button
            onClick={downloadResponse}
            size="sm"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-1" />
            Télécharger
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <span className={`px-2 py-1 rounded ${getStatusColor(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="text-gray-600">
          Temps: {response.time}ms
        </span>
        <span className="text-gray-600">
          Taille: {response.size} bytes
        </span>
      </div>

      <Tabs defaultValue="body" className={fullView ? 'flex-1 flex flex-col' : ''}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="curl">cURL</TabsTrigger>
        </TabsList>

        <TabsContent value="body" className={`${fullView ? 'flex-1' : ''} space-y-2`}>
          <pre className={`bg-gray-50 p-4 rounded-lg overflow-auto text-sm border ${fullView ? 'flex-1' : 'max-h-96'}`}>
            {viewMode === 'pretty' 
              ? JSON.stringify(response.data, null, 2)
              : JSON.stringify(response.data)
            }
          </pre>
        </TabsContent>

        <TabsContent value="headers" className="space-y-2">
          <div className="bg-gray-50 p-4 rounded-lg border">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex text-sm border-b border-gray-200 py-1">
                <span className="font-medium w-1/3">{key}:</span>
                <span className="text-gray-600">{value as string}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="curl" className="space-y-2">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <pre className="text-sm whitespace-pre-wrap">
              {generateCurlCommand()}
            </pre>
            <Button
              onClick={() => copyToClipboard(generateCurlCommand())}
              size="sm"
              className="mt-2"
              variant="outline"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copier cURL
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
