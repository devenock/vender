const CheckoutPage = () => {
    return(
            <div className="flex flex-col min-h-screen">
                <main className="flex-1 py-8 md:py-12">
                    <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
                        <div className="space-y-8">
                            <div>
                                <div>
                                    <h3>Order Summary</h3>
                                </div>
                                <div>
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img src="/placeholder.svg" width={64} height={64} alt="Product Image" className="rounded-md" />
                                                <div>
                                                    <h3 className="font-medium">Acme Prism T-Shirt</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Size: M, Color: Black</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">$49.99</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: 1</p>
                                            </div>
                                        </div>
                                        <hr />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <img src="/placeholder.svg" width={64} height={64} alt="Product Image" className="rounded-md" />
                                                <div>
                                                    <h3 className="font-medium">Acme Prism Shorts</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Size: 32, Color: Blue</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">$39.99</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: 1</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
                                            <p>$89.98</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-500 dark:text-gray-400">Shipping</p>
                                            <p>$5.00</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-500 dark:text-gray-400">Tax</p>
                                            <p>$7.20</p>
                                        </div>
                                        <hr />
                                        <div className="flex items-center justify-between font-medium">
                                            <p>Total</p>
                                            <p>$102.18</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <h3>Shipping Information</h3>
                                </div>
                                <div>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <label htmlFor="name">Name</label>
                                            <input id="name" placeholder="John Doe" />
                                        </div>
                                        <div className="grid gap-2">
                                            <label htmlFor="address">Address</label>
                                            <input id="address" placeholder="123 Main St" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label htmlFor="city">City</label>
                                                <input id="city" placeholder="Anytown" />
                                            </div>
                                            <div className="grid gap-2">
                                                <label htmlFor="state">State</label>
                                                <input id="state" placeholder="CA" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <label htmlFor="zip">Zip</label>
                                                <input id="zip" placeholder="12345" />
                                            </div>
                                            <div className="grid gap-2">
                                                <label htmlFor="country">Country</label>
                                                <select id="country">
                                                    {/*<SelectTrigger>*/}
                                                    {/*    <SelectValue placeholder="United States" />*/}
                                                    {/*</SelectTrigger>*/}
                                                    {/*<SelectContent>*/}
                                                    {/*    <SelectItem value="us">United States</SelectItem>*/}
                                                    {/*    <SelectItem value="ca">Canada</SelectItem>*/}
                                                    {/*    <SelectItem value="mx">Mexico</SelectItem>*/}
                                                    {/*</SelectContent>*/}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <h3>Payment Method</h3>
                                </div>
                                <div>
                                    <div defaultValue="card" className="grid gap-4">
                                        <div>
                                            {/*<RadioGroupItem value="card" id="card" className="peer sr-only" />*/}
                                            <label
                                                htmlFor="card"
                                                className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-gray-900 [&:has([data-state=checked])]:border-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:peer-data-[state=checked]:border-gray-50 dark:[&:has([data-state=checked])]:border-gray-50"
                                            >
                                                {/*<CreditCardIcon className="h-6 w-6" />*/}
                                                <div>
                                                    <h3 className="font-medium">Credit/Debit Card</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Pay securely with your credit or debit card.
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                        <div>
                                            {/*<RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />*/}
                                            <label
                                                htmlFor="paypal"
                                                className="flex items-center gap-4 rounded-md border border-gray-200 bg-white p-4 hover:bg-gray-100 hover:text-gray-900 peer-data-[state=checked]:border-gray-900 [&:has([data-state=checked])]:border-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:peer-data-[state=checked]:border-gray-50 dark:[&:has([data-state=checked])]:border-gray-50"
                                            >
                                                {/*<WalletCardsIcon className="h-6 w-6" />*/}
                                                <div>
                                                    <h3 className="font-medium">PayPal</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Pay securely with your PayPal account.
                                                    </p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <h3>Promo Code</h3>
                                </div>
                                <div>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Enter promo code" className="flex-1" />
                                        <button>Apply</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <div>
                                    <h3>Review Order</h3>
                                </div>
                                <div>
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between">
                                            <p>Subtotal</p>
                                            <p>$89.98</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p>Shipping</p>
                                            <p>$5.00</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p>Tax</p>
                                            <p>$7.20</p>
                                        </div>
                                        <hr />
                                        <div className="flex items-center justify-between font-medium">
                                            <p>Total</p>
                                            <p>$102.18</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button className="w-full">Place Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    export default CheckoutPage;