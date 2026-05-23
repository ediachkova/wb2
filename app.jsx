
// ── Main App Router ───────────────────────────────────────────────────────────

function App() {
  const [page, setPage] = React.useState('login');

  const authPages = ['login', 'register'];
  const isAuth = authPages.includes(page);

  function renderPage() {
    switch(page) {
      case 'login':    return React.createElement(LoginPage, { setPage });
      case 'register': return React.createElement(RegisterPage, { setPage });

      case 'dashboard': return React.createElement(DashboardPage);

      case 'reports/nomenclature':
        return React.createElement(NomenclatureReportV2, { paid: false });
      case 'reports/nomenclature-pro':
        return React.createElement(NomenclatureReportV2, { paid: true });

      case 'reports/weekly': return React.createElement(WeeklyReport);

      case 'reports/pnl':
      case 'reports/pnl-pro':
        return React.createElement(PnLReport);

      case 'directories/nomenclature': return React.createElement(NomenclatureDirectory);
      case 'directories/sku-link': return React.createElement(SkuLinkDictionary);
      case 'directories/expense-items': return React.createElement(ExpenseItemsDirectory);
      case 'directories/cost-supply': return React.createElement(CostBySupplyDirectory);
      case 'directories/cost-period': return React.createElement(CostByPeriodDirectory);

      case 'registers/operations': return React.createElement(OperationsRegister);

      case 'settings/profile': return React.createElement(SettingsProfile);
      case 'settings/api': return React.createElement(SettingsAPI);
      case 'settings/norms': return React.createElement(SettingsNorms);
      case 'settings/notifications': return React.createElement(SettingsNotifications);

      default: return React.createElement(DashboardPage);
    }
  }

  if (isAuth) return React.createElement(ThemeProvider, null,
    React.createElement(ToastProvider, null, renderPage())
  );

  return React.createElement(ThemeProvider, null,
    React.createElement(ToastProvider, null,
      React.createElement(Layout, { page, setPage },
        renderPage()
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
