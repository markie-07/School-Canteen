import UserLayout from '@/Layouts/UserLayout';
import { Head } from '@inertiajs/react';

export default function UserDashboard({ auth }) {
    return (
        <UserLayout
            header={<h2>Lunch Menu Selection</h2>}
        >
            <Head title="Student Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-gray-900">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-4">Welcome back, {auth.user.name}! 🍟</h3>
                            <p className="text-gray-600">Ready to order your lunch?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-32 bg-gray-100 flex items-center justify-center text-4xl">
                                        {i === 1 ? '🍔' : i === 2 ? '🍕' : i === 3 ? '🥗' : '🥤'}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold">Meal Option {i}</h4>
                                        <p className="text-sm text-gray-500 mb-2">Delicious and healthy.</p>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-red-500">$5.00</span>
                                            <button className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Order</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
