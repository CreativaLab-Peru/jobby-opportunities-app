import { Briefcase, Linkedin, Twitter, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-xl">
                <Briefcase className="w-6 h-6 text-gray-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">Levely</span>
                <span className="text-xs text-gray-400 -mt-1">Opportunities</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Plataforma empresarial para la gestión eficiente de oportunidades laborales, becas y programas de desarrollo profesional.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                aria-label="Visitar perfil de Levely en LinkedIn"
                className="flex items-center justify-center w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Visitar perfil de Levely en Twitter"
                className="flex items-center justify-center w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Visitar repositorio de Levely en GitHub"
                className="flex items-center justify-center w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:contacto@levely.com"
                aria-label="Enviar correo a contacto@levely.com"
                className="flex items-center justify-center w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links - Empresa */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Acerca de</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Planes</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contacto</a>
              </li>
            </ul>
          </div>

          {/* Links - Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacidad</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Términos</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cookies</a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Licencias</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} CreativaLab. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-500">
              Hecho con ❤️ para empresas que transforman el futuro
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;