export const hasPermission = (user, module, action = 'view') => {
  if (!user) return false;
  if (user.role === 'ADMIN' && module === 'roles' && ['view', 'update'].includes(action)) {
    return true;
  }
  if (user.role === 'MANAGER' && module === 'roles') {
    return false;
  }

  return Boolean(user.permissions?.[module]?.[action]);
};

export const filterMenuByPermission = (items, user) => {
  return items
    .map((item) => {
      if (item.subItems) {
        const subItems = item.subItems.filter((subItem) => (
          !subItem.permission || hasPermission(user, subItem.permission.module, subItem.permission.action || 'view')
        ));
        return { ...item, subItems };
      }
      return item;
    })
    .filter((item) => {
      if (item.subItems) return item.subItems.length > 0;
      if (!item.permission) return true;
      return hasPermission(user, item.permission.module, item.permission.action || 'view');
    });
};
