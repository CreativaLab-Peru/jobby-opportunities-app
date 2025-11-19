interface HeaderProps {
    authenticated: boolean;
}

const Header = ({ authenticated }: HeaderProps) => {
    return (
        <header className="bg-blue-600 text-white p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Jobby Opportunities</h1>
                {authenticated ? (
                    <nav>
                        <a href="/dashboard" className="mr-4 hover:underline">Dashboard</a>
                        <a href="/profile" className="hover:underline">Profile</a>
                    </nav>
                ) : (
                    <nav>
                        <a href="/login" className="mr-4 hover:underline">Login</a>
                        <a href="/register" className="hover:underline">Register</a>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;