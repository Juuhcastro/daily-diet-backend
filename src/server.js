const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

// "Banco de dados" em memória
let users = []       // { id, name }
let meals = []       // { id, userId, name, description, dateTime, isInsideDiet }

// Middleware para identificar usuário pelo header
function ensureUser(req, res, next) {
  const userId = req.header('user-id')

  if (!userId) {
    return res.status(400).json({ error: 'Header "user-id" é obrigatório.' })
  }

  const userExists = users.find((user) => user.id === userId)

  if (!userExists) {
    return res.status(404).json({ error: 'Usuário não encontrado.' })
  }

  req.userId = userId
  next()
}

// Rota básica para teste
app.get('/', (req, res) => {
  res.json({ message: 'Daily Diet API OK' })
})

/**
 * USUÁRIOS
 */

// Criar / reutilizar usuário
app.post('/users', (req, res) => {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório.' })
  }

  // se já existir usuário com esse nome, reaproveita
  const existingUser = users.find(
    (user) => user.name.toLowerCase() === name.toLowerCase()
  )

  if (existingUser) {
    return res.status(200).json(existingUser)
  }

  // senão, cria novo
  const id = String(Date.now())
  const newUser = { id, name }

  users.push(newUser)

  return res.status(201).json(newUser)
})

// Listar usuários (só para conferência)
app.get('/users', (req, res) => {
  return res.json(users)
})

/**
 * REFEIÇÕES
 * Todas as rotas abaixo exigem usuário identificado
 */

// MÉTRICAS – TEM QUE VIR ANTES DE /meals/:id
app.get('/meals/metrics', ensureUser, (req, res) => {
  const userMeals = meals.filter((meal) => meal.userId === req.userId)

  const total = userMeals.length
  const inside = userMeals.filter((m) => m.isInsideDiet).length
  const outside = total - inside

  // Melhor sequência dentro da dieta
  const sortedMeals = [...userMeals].sort((a, b) => {
    return new Date(a.dateTime) - new Date(b.dateTime)
  })

  let bestSequence = 0
  let currentSequence = 0

  for (const meal of sortedMeals) {
    if (meal.isInsideDiet) {
      currentSequence += 1
      if (currentSequence > bestSequence) {
        bestSequence = currentSequence
      }
    } else {
      currentSequence = 0
    }
  }

  return res.json({
    totalMeals: total,
    mealsInsideDiet: inside,
    mealsOutsideDiet: outside,
    bestInsideDietSequence: bestSequence
  })
})

// Criar refeição
app.post('/meals', ensureUser, (req, res) => {
  const { name, description, dateTime, isInsideDiet } = req.body

  if (!name || !dateTime || typeof isInsideDiet !== 'boolean') {
    return res.status(400).json({
      error: 'Campos obrigatórios: name, dateTime, isInsideDiet (boolean).'
    })
  }

  const id = String(Date.now())

  const newMeal = {
    id,
    userId: req.userId,
    name,
    description: description || '',
    dateTime,
    isInsideDiet
  }

  meals.push(newMeal)

  return res.status(201).json(newMeal)
})

// Listar todas as refeições do usuário
app.get('/meals', ensureUser, (req, res) => {
  const userMeals = meals.filter((meal) => meal.userId === req.userId)
  return res.json(userMeals)
})

// Buscar uma refeição específica
app.get('/meals/:id', ensureUser, (req, res) => {
  const { id } = req.params

  const meal = meals.find(
    (meal) => meal.id === id && meal.userId === req.userId
  )

  if (!meal) {
    return res.status(404).json({ error: 'Refeição não encontrada.' })
  }

  return res.json(meal)
})

// Editar refeição
app.put('/meals/:id', ensureUser, (req, res) => {
  const { id } = req.params
  const { name, description, dateTime, isInsideDiet } = req.body

  const mealIndex = meals.findIndex(
    (meal) => meal.id === id && meal.userId === req.userId
  )

  if (mealIndex === -1) {
    return res.status(404).json({ error: 'Refeição não encontrada.' })
  }

  const oldMeal = meals[mealIndex]

  meals[mealIndex] = {
    ...oldMeal,
    name: name ?? oldMeal.name,
    description: description ?? oldMeal.description,
    dateTime: dateTime ?? oldMeal.dateTime,
    isInsideDiet:
      typeof isInsideDiet === 'boolean' ? isInsideDiet : oldMeal.isInsideDiet
  }

  return res.json(meals[mealIndex])
})

// Deletar refeição
app.delete('/meals/:id', ensureUser, (req, res) => {
  const { id } = req.params

  const mealIndex = meals.findIndex(
    (meal) => meal.id === id && meal.userId === req.userId
  )

  if (mealIndex === -1) {
    return res.status(404).json({ error: 'Refeição não encontrada.' })
  }

  meals.splice(mealIndex, 1)

  return res.status(204).send()
})

const PORT = 3333
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
