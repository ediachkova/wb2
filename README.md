# NotesApp — iOS заметки с push-уведомлениями и категориями

## Функции
- ✅ Создание, редактирование, удаление заметок
- ✅ Категории с пользовательским именем и цветом (10 пресетов)
- ✅ Фильтрация заметок по категориям (боковая панель / NavigationSplitView)
- ✅ Поиск по заголовку и тексту
- ✅ Локальные push-уведомления с выбором даты/времени
- ✅ CoreData — данные сохраняются между запусками

---

## Файлы проекта

| Файл | Назначение |
|------|-----------|
| `NotesApp.swift` | @main — точка входа |
| `AppDelegate.swift` | UNUserNotificationCenterDelegate |
| `PersistenceController.swift` | CoreData стек |
| `PersistenceController+Model.swift` | Программная CoreData модель (Note + Category) |
| `NoteEntity.swift` | NSManagedObject для заметки |
| `CategoryEntity.swift` | NSManagedObject для категории |
| `Color+Hex.swift` | Конвертация цветов |
| `NotificationManager.swift` | Расписание уведомлений |
| `CategoryManager.swift` | CRUD категорий |
| `NotesViewModel.swift` | Бизнес-логика заметок |
| `ContentView.swift` | NavigationSplitView + сайдбар |
| `NoteListView.swift` | Список заметок с фильтром |
| `NoteRowView.swift` | Ячейка с цветной полоской |
| `NoteEditorView.swift` | Редактор + категория + напоминание |
| `CategoriesManagementView.swift` | Управление категориями |

---

## Как запустить

### 1. Создать проект в Xcode
- File → New → App
- Product Name: `NotesApp`
- Interface: SwiftUI, Language: Swift
- **Use Core Data: НЕТ** (используем программную модель)

### 2. Скопировать все файлы
Перетащи все `.swift` файлы в навигатор проекта Xcode.
Удали дефолтные `ContentView.swift` и `NotesAppApp.swift`.

### 3. Обновить точку входа
В `NotesApp.swift` убедись что `PersistenceController.shared` заменён на `PersistenceController.sharedProgrammatic`:

```swift
let persistenceController = PersistenceController.sharedProgrammatic
```

### 4. Info.plist
Добавь ключ для уведомлений:
```
NSUserNotificationUsageDescription → "Для напоминаний о заметках"
```

### 5. Run ▶

---

## Архитектура категорий

```
CategoryEntity (CoreData)
  ├── id: UUID
  ├── name: String
  ├── colorHex: String ("#FF9500")
  └── notes: [NoteEntity]  ← обратная связь

NoteEntity
  └── category: CategoryEntity?  ← опциональная ссылка
```

Связь **one-to-many**: одна категория → много заметок.  
При удалении категории заметки сохраняются (category = nil).
