import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-1">General Settings</h2>
        <p className="text-gray-600">Configure your store settings and preferences</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store">Store Information</TabsTrigger>
          <TabsTrigger value="payment">Payment Settings</TabsTrigger>
          <TabsTrigger value="shipping">Shipping Settings</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card className="p-6">
            <h3 className="text-xl mb-4">Store Information</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="store-name">Store Name</Label>
                <Input 
                  id="store-name" 
                  defaultValue="My E-commerce Store"
                />
              </div>

              <div>
                <Label htmlFor="store-description">Store Description</Label>
                <Textarea 
                  id="store-description" 
                  rows={3}
                  defaultValue="Quality products delivered to your doorstep"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store-email">Contact Email</Label>
                  <Input 
                    id="store-email" 
                    type="email"
                    defaultValue="contact@store.com"
                  />
                </div>
                <div>
                  <Label htmlFor="store-phone">Contact Phone</Label>
                  <Input 
                    id="store-phone" 
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="store-address">Store Address</Label>
                <Textarea 
                  id="store-address" 
                  rows={3}
                  defaultValue="123 Main Street, New York, NY 10001"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="EST">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EST">EST - Eastern Time</SelectItem>
                      <SelectItem value="CST">CST - Central Time</SelectItem>
                      <SelectItem value="PST">PST - Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
                Save Changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="p-6">
            <h3 className="text-xl mb-4">Payment Settings</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Switch id="stripe" defaultChecked />
                    <div>
                      <Label htmlFor="stripe">Stripe</Label>
                      <p className="text-sm text-gray-600">Accept credit card payments</p>
                    </div>
                  </div>
                </div>

                <div className="pl-16 space-y-4">
                  <div>
                    <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                    <Input 
                      id="stripe-key" 
                      placeholder="pk_live_..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                    <Input 
                      id="stripe-secret" 
                      type="password"
                      placeholder="sk_live_..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Switch id="paypal" />
                  <div>
                    <Label htmlFor="paypal">PayPal</Label>
                    <p className="text-sm text-gray-600">Accept PayPal payments</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Switch id="cod" defaultChecked />
                  <div>
                    <Label htmlFor="cod">Cash on Delivery</Label>
                    <p className="text-sm text-gray-600">Accept cash payments on delivery</p>
                  </div>
                </div>
              </div>

              <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
                Save Payment Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card className="p-6">
            <h3 className="text-xl mb-4">Shipping Settings</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="shipping-method">Default Shipping Method</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Shipping</SelectItem>
                    <SelectItem value="express">Express Shipping</SelectItem>
                    <SelectItem value="overnight">Overnight Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shipping-cost">Standard Shipping Cost</Label>
                  <Input 
                    id="shipping-cost" 
                    type="number"
                    defaultValue="15.00"
                  />
                </div>
                <div>
                  <Label htmlFor="free-shipping">Free Shipping Threshold</Label>
                  <Input 
                    id="free-shipping" 
                    type="number"
                    defaultValue="100.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="delivery-time">Estimated Delivery Time</Label>
                <Input 
                  id="delivery-time" 
                  defaultValue="3-5 business days"
                />
              </div>

              <div className="flex items-center gap-4">
                <Switch id="track-shipment" defaultChecked />
                <Label htmlFor="track-shipment">Enable shipment tracking</Label>
              </div>

              <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
                Save Shipping Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="p-6">
            <h3 className="text-xl mb-4">Email Settings</h3>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input 
                  id="smtp-host" 
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input 
                    id="smtp-port" 
                    defaultValue="587"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp-encryption">Encryption</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input 
                  id="smtp-username" 
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input 
                  id="smtp-password" 
                  type="password"
                  placeholder="Your app password"
                />
              </div>

              <div>
                <Label htmlFor="from-email">From Email</Label>
                <Input 
                  id="from-email" 
                  defaultValue="noreply@store.com"
                />
              </div>

              <div>
                <Label htmlFor="from-name">From Name</Label>
                <Input 
                  id="from-name" 
                  defaultValue="My E-commerce Store"
                />
              </div>

              <div className="pt-4 border-t">
                <h4 className="mb-4">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Switch id="order-confirmation" defaultChecked />
                    <Label htmlFor="order-confirmation">Send order confirmation emails</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch id="shipping-notification" defaultChecked />
                    <Label htmlFor="shipping-notification">Send shipping notification emails</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch id="delivery-notification" defaultChecked />
                    <Label htmlFor="delivery-notification">Send delivery confirmation emails</Label>
                  </div>
                </div>
              </div>

              <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
                Save Email Settings
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
