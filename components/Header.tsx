import { Briefcase, LogIn, UserPlus, LayoutDashboard, User } from 'lucide-react';

interface HeaderProps {
    authenticated: boolean;
}

const Header = ({ authenticated }: HeaderProps) => {
    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3 group">
                        <div className="flex items-center justify-center w-10 h-10 bg-black rounded-xl group-hover:bg-gray-800 transition-colors">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gray-900">Levely</span>
                            <span className="text-xs text-gray-500 -mt-1">Opportunities</span>
                        </div>
                    </a>
                    
                    {/* Navigation */}
                    {authenticated ? (
                        <nav className="flex items-center gap-2">
                            <a 
                                href="/dashboard" 
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Panel de control
                            </a>
                            <a 
                                href="/profile" 
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <User className="w-4 h-4" />
                                Perfil
                            </a>
                        </nav>
                    ) : (
                        <nav className="flex items-center gap-3">
                            <a 
                                href="/login" 
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <LogIn className="w-4 h-4" />
                                Iniciar sesión
                            </a>
                            <a 
                                href="/register" 
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <UserPlus className="w-4 h-4" />
                                Registrar empresa
                            </a>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;