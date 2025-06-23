
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, Save, TestTube } from 'lucide-react';

const DEFAULT_IP = '192.168.94.129';
const DEFAULT_PORT = '8181';

export const Settings: React.FC = () => {
  const [ipAddress, setIpAddress] = useState(DEFAULT_IP);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Charger les paramètres sauvegardés
    const savedIP = localStorage.getItem('onos-controller-ip');
    const savedPort = localStorage.getItem('onos-controller-port');
    
    if (savedIP) setIpAddress(savedIP);
    if (savedPort) setPort(savedPort);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('onos-controller-ip', ipAddress);
    localStorage.setItem('onos-controller-port', port);
    
    // Déclencher un événement pour mettre à jour l'API
    window.dispatchEvent(new CustomEvent('onos-config-changed', {
      detail: { ip: ipAddress, port }
    }));

    toast({
      title: "Paramètres sauvegardés",
      description: `Adresse IP: ${ipAddress}:${port}`,
    });
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const testUrl = `http://${ipAddress}:${port}/onos/v1/`;
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Basic ' + btoa('onos:rocks')
        },
        timeout: 5000
      });

      if (response.ok) {
        toast({
          title: "Connexion réussie",
          description: `Le contrôleur ONOS répond sur ${ipAddress}:${port}`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Échec de la connexion",
        description: `Impossible de se connecter à ${ipAddress}:${port}`,
        variant: "destructive"
      });
    }
    setTesting(false);
  };

  const resetToDefault = () => {
    setIpAddress(DEFAULT_IP);
    setPort(DEFAULT_PORT);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration du Contrôleur ONOS</CardTitle>
          <CardDescription>
            Configurez l'adresse IP et le port du contrôleur ONOS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ip-address">Adresse IP</Label>
              <Input
                id="ip-address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.94.129"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="8181"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={saveSettings} className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </Button>
            <Button 
              onClick={testConnection} 
              variant="outline" 
              disabled={testing}
              className="flex items-center space-x-2"
            >
              <TestTube className="w-4 h-4" />
              <span>{testing ? 'Test en cours...' : 'Tester la connexion'}</span>
            </Button>
            <Button onClick={resetToDefault} variant="outline">
              Réinitialiser
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>URL actuelle:</strong> http://{ipAddress}:{port}/onos/v1/</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
