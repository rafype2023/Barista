import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Product, CartItem, Order, SizeOption, User } from './types';
import { api } from './services/apiService';
import { CheckIcon, PlusIcon, MinusIcon, ChevronRightIcon, SpinnerIcon } from './components/icons';
import Login from './components/Login';

// --- Order Summary Modal Component ---
const OrderSummaryModal: React.FC<{
    order: Order;
    items: CartItem[];
    onClose: () => void;
}> = ({ order, items, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
        <div className="w-full max-w-md bg-brand-surface p-8 rounded-2xl shadow-lg text-center">
            <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
                <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-brand-text-primary mb-2">¡Pedido Confirmado!</h2>
            <p className="text-brand-text-secondary mb-6">Gracias por tu pedido, {order.userName}. Estará listo pronto.</p>
            
            <div className="bg-brand-muted p-4 rounded-lg text-left mb-6">
                <h3 className="font-bold text-brand-text-primary mb-2">Resumen del Pedido</h3>
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-baseline text-brand-text-secondary text-sm mb-1">
                        <span>{item.quantity}x {item.name} ({item.size})</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="border-t border-brand-border my-2"></div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-brand-text-primary">TOTAL</span>
                    <span className="font-bold text-brand-text-primary text-lg">${order.total.toFixed(2)}</span>
                </div>
            </div>

            <button
                type="button"
                onClick={onClose}
                className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary-hover transition-colors"
            >
                Entendido
            </button>
        </div>
    </div>
);


// --- Verification Modal Component ---

const VerificationModal: React.FC<{
    email: string;
    onClose: () => void;
    onSubmit: (code: string) => Promise<boolean>;
}> = ({ email, onClose, onSubmit }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) {
            setError('El código debe tener 6 dígitos.');
            return;
        }
        setError('');
        setIsLoading(true);
        const success = await onSubmit(code);
        setIsLoading(false);
        if (!success) {
            setError('Código incorrecto. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="w-full max-w-md bg-brand-surface p-8 rounded-2xl shadow-lg relative">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-3xl font-bold text-brand-text-primary mb-2">Verificar Pedido</h2>
                    <p className="text-brand-text-secondary mb-6">
                        Enviamos un código a <span className="font-semibold text-brand-text-primary">{email}</span>.
                    </p>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4" role="alert">{error}</p>}
                    <div className="mb-6">
                        <label htmlFor="code" className="block text-sm font-medium text-brand-text-secondary mb-2">Código de 6 dígitos</label>
                        <input
                            type="text"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength={6}
                            className="w-full px-4 py-3 border border-brand-border rounded-lg text-center tracking-[0.5em] text-lg font-semibold focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary outline-none transition"
                            placeholder="______"
                            autoComplete="one-time-code"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center justify-center disabled:opacity-50"
                        >
                            {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Confirmar Pedido'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full text-center text-brand-secondary hover:underline"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Reusable Child Components ---

const Header: React.FC<{ user: User }> = ({ user }) => (
    <header className="bg-brand-muted p-6 rounded-xl flex justify-between items-center mb-8 shadow-sm">
        <h1 className="text-4xl font-bold text-brand-text-primary">Hola, {user.name || 'Cliente'}!</h1>
        {user.email === 'barista@gmail.com' && (
            <button className="flex items-center gap-3 text-brand-text-primary font-semibold text-lg bg-brand-surface px-5 py-3 rounded-full shadow-sm hover:shadow-md transition-shadow">
                <span className="bg-brand-secondary text-white rounded-full h-8 w-8 flex items-center justify-center">
                    <CheckIcon className="h-5 w-5" />
                </span>
                Ver Panel Barista
            </button>
        )}
    </header>
);

const QuantityControl: React.FC<{
    quantity: number;
    onDecrement: () => void;
    onIncrement: () => void;
}> = ({ quantity, onDecrement, onIncrement }) => (
    <div className="flex items-center gap-3">
        <button onClick={onDecrement} aria-label="Disminuir cantidad" className="bg-brand-surface border border-brand-secondary text-brand-secondary rounded-full h-8 w-8 flex items-center justify-center hover:bg-brand-secondary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={quantity === 0}>
            <MinusIcon className="h-4 w-4" />
        </button>
        <span className="font-bold text-lg text-brand-text-primary w-8 text-center" aria-live="polite">{quantity}</span>
        <button onClick={onIncrement} aria-label="Aumentar cantidad" className="bg-brand-secondary text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-brand-secondary-hover transition-colors">
            <PlusIcon className="h-4 w-4" />
        </button>
    </div>
);

const ProductCard: React.FC<{
    product: Product;
    cart: { [key: string]: CartItem };
    onQuantityChange: (product: Product, size: SizeOption, newQuantity: number) => void;
}> = ({ product, cart, onQuantityChange }) => {
    const [selectedSize, setSelectedSize] = useState<SizeOption>(product.sizes[0]);
    const quantity = cart[`${product.id}-${selectedSize.size}`]?.quantity || 0;

    return (
        <section className="bg-brand-surface p-5 rounded-xl shadow-sm flex gap-5" aria-labelledby={`product-name-${product.id}`}>
            <div className="w-1/3 max-w-[160px] aspect-square rounded-lg overflow-hidden bg-brand-muted flex-shrink-0">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <SpinnerIcon className="animate-spin h-8 w-8 text-brand-secondary" />
                    </div>
                )}
            </div>
            
            <div className="flex flex-col flex-grow justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 id={`product-name-${product.id}`} className="font-bold text-brand-text-primary text-lg">{product.name}</h3>
                            <p className="text-brand-text-secondary text-sm mt-1">{product.description}</p>
                        </div>
                        <span className="font-bold text-lg text-brand-text-primary ml-4 flex-shrink-0">${selectedSize.price.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                     <div className="flex gap-2 flex-wrap">
                        {product.sizes.map(sizeOption => (
                            <button
                                key={sizeOption.size}
                                onClick={() => setSelectedSize(sizeOption)}
                                className={`px-3 py-1.5 rounded-full font-semibold text-sm transition-colors ${
                                    selectedSize.size === sizeOption.size
                                        ? 'bg-brand-secondary text-white'
                                        : 'bg-brand-muted text-brand-text-secondary hover:bg-brand-border'
                                }`}
                            >
                                {sizeOption.size}
                            </button>
                        ))}
                    </div>
                    <QuantityControl
                        quantity={quantity}
                        onDecrement={() => onQuantityChange(product, selectedSize, Math.max(0, quantity - 1))}
                        onIncrement={() => onQuantityChange(product, selectedSize, quantity + 1)}
                    />
                </div>
            </div>
        </section>
    );
};


const Cart: React.FC<{
    cartItems: CartItem[];
    total: number;
    onPlaceOrder: () => void;
    isPlacingOrder: boolean;
    userName: string;
    userEmail: string;
}> = ({ cartItems, total, onPlaceOrder, isPlacingOrder, userName, userEmail }) => (
    <aside className="bg-brand-surface p-6 rounded-xl shadow-md sticky top-8">
        <h2 className="text-xl font-bold text-brand-text-primary mb-4">Tu Pedido</h2>
        <div className="mb-4 space-y-3">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary mb-1">Nombre</label>
                <input
                    type="text"
                    id="name"
                    value={userName}
                    readOnly
                    className="w-full px-4 py-3 border border-brand-border rounded-lg bg-brand-muted cursor-not-allowed outline-none"
                    placeholder="Tu nombre"
                    required
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-1">Correo Electrónico</label>
                <input
                    type="email"
                    id="email"
                    value={userEmail}
                    readOnly
                    className="w-full px-4 py-3 border border-brand-border rounded-lg bg-brand-muted cursor-not-allowed outline-none"
                    placeholder="tu.correo@empresa.com"
                    required
                />
            </div>
        </div>
        <div className="border-t border-brand-border my-4"></div>
        {cartItems.length > 0 ? (
            cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-baseline text-brand-text-secondary mb-2">
                    <span>{item.quantity}x {item.name} ({item.size})</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            ))
        ) : (
            <p className="text-brand-text-secondary text-center mb-4">Tu carrito está vacío.</p>
        )}
        <div className="border-t border-brand-border my-4"></div>
        <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-brand-text-primary text-xl">TOTAL</span>
            <span className="font-bold text-brand-text-primary text-2xl">${total.toFixed(2)}</span>
        </div>
        <button
            onClick={onPlaceOrder}
            disabled={cartItems.length === 0 || isPlacingOrder || !userName || !userEmail}
            className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
            {isPlacingOrder ? <SpinnerIcon className="animate-spin h-6 w-6" /> : "Realizar Pedido"}
        </button>
    </aside>
);

const ConfirmedOrders: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <aside className="bg-brand-surface p-6 rounded-xl shadow-md mt-8">
        <h2 className="font-bold text-brand-text-primary text-xl mb-4 flex items-center gap-2">
            Pedidos Confirmados (Barista) <CheckIcon className="h-5 w-5 text-green-600" />
        </h2>
        <div className="space-y-3">
            {orders.map((order, index) => (
                <div key={order.id} className="bg-brand-muted p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <span className="font-semibold text-brand-text-primary">Pedido para: [{order.userName}]</span>
                    </div>
                    {index === 0 ? (
                         <button className="bg-brand-surface border border-brand-secondary text-brand-secondary rounded-full h-7 w-7 flex items-center justify-center" aria-label="Cancelar primer pedido">
                            <MinusIcon className="h-4 w-4" />
                        </button>
                    ) : (
                         <ChevronRightIcon className="h-5 w-5 text-brand-secondary"/>
                    )}
                </div>
            ))}
        </div>
    </aside>
);


// --- Main App Component ---

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
    const [cart, setCart] = useState<{ [key: string]: CartItem }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [lastOrder, setLastOrder] = useState<{order: Order, items: CartItem[]} | null>(null);


    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [productsData, ordersData] = await Promise.all([
                    api.getProducts(),
                    api.getConfirmedOrders(),
                ]);
                setConfirmedOrders(ordersData);
                setProducts(productsData);

                const imagePromises = productsData.map(product => {
                    if (!product.imageUrl) {
                        return api.generateProductImage(product.name);
                    }
                    return Promise.resolve(product.imageUrl);
                });

                const imageUrls = await Promise.all(imagePromises);
                
                const productsWithImages = productsData.map((product, index) => ({
                    ...product,
                    imageUrl: imageUrls[index],
                }));

                setProducts(productsWithImages);

            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
          fetchInitialData();
        }
    }, [user]);

    const handleLoginSuccess = (loggedInUser: User) => {
        setUser(loggedInUser);
    };

    const handleQuantityChange = useCallback((product: Product, size: SizeOption, newQuantity: number) => {
        setCart(currentCart => {
            const newCart = { ...currentCart };
            const cartId = `${product.id}-${size.size}`;

            if (newQuantity <= 0) {
                delete newCart[cartId];
            } else {
                newCart[cartId] = {
                    id: cartId,
                    productId: product.id,
                    name: product.name,
                    quantity: newQuantity,
                    size: size.size,
                    price: size.price
                };
            }
            return newCart;
        });
    }, []);

    const handlePlaceOrder = async () => {
        if (!user) return;
        setIsPlacingOrder(true);
        const response = await api.sendVerificationCode(user.name, user.email);
        setIsPlacingOrder(false);

        if (response.success) {
            setIsVerifying(true);
        } else {
            alert('No se pudo enviar el código. Por favor, intente de nuevo.');
        }
    };

    const cartItems = useMemo(() => Object.values(cart).sort((a, b) => a.name.localeCompare(b.name)), [cart]);
    const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);

    const handleVerifyAndSubmitOrder = async (code: string): Promise<boolean> => {
        if (!user) return false;

        const orderDetails = Object.values(cart).reduce((acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
        }, {} as { [key: string]: number });

        const response = await api.verifyCodeAndPlaceOrder(user.name, user.email, code, orderDetails, cartTotal);

        if (response.success && response.order) {
            setConfirmedOrders(prevOrders => [response.order!, ...prevOrders]);
            setLastOrder({ order: response.order, items: cartItems });
            setCart({});
            setIsVerifying(false);
            return true;
        } else {
            return false;
        }
    };

    if (!user) {
      return <Login onLoginSuccess={handleLoginSuccess} />
    }

    if (isLoading && products.length === 0) {
        return <div className="min-h-screen flex items-center justify-center"><SpinnerIcon className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-8 font-sans text-brand-text-primary">
            <Header user={user} />
            <main className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            cart={cart}
                            onQuantityChange={handleQuantityChange}
                        />
                    ))}
                </div>

                <div className="lg:col-span-1 mt-8 lg:mt-0">
                   <Cart 
                        cartItems={cartItems} 
                        total={cartTotal} 
                        onPlaceOrder={handlePlaceOrder} 
                        isPlacingOrder={isPlacingOrder}
                        userName={user.name}
                        userEmail={user.email}
                    />
                   <ConfirmedOrders orders={confirmedOrders} />
                </div>
            </main>
            {isVerifying && (
                <VerificationModal 
                    email={user.email}
                    onClose={() => setIsVerifying(false)}
                    onSubmit={handleVerifyAndSubmitOrder}
                />
            )}
             {lastOrder && (
                <OrderSummaryModal
                    order={lastOrder.order}
                    items={lastOrder.items}
                    onClose={() => setLastOrder(null)}
                />
            )}
        </div>
    );
}

export default App;