import './App.css';
import { useEffect, useRef, useState } from 'react';
import Retter from '@retter/sdk'
import { Button, Table, Modal, Form } from 'react-bootstrap';


function App() {
  const [todos, setTodos] = useState([])
  const [editModalShow, setEditModalShow] = useState(false);
  const [addModalShow, setAddModalShow] = useState(false);

  const rio = Retter.getInstance({
    projectId: '63aumbij5',
    url: 'api.a101prod.retter.io'
  })

  async function startEngine() {
    // Get class
    const authenticateClass = await rio.getCloudObject({
      classId: 'Authenticate',
      instanceId: '01gknx98vaygbzb68vqkacs3ee'
    })

    // Get Custom Token
    const response = await authenticateClass.call({
      method: 'generateCustomToken',
      body: {
        userId: "userId"
      }
    })

    //Authenticate
    const customToken = response.data.data.customToken
    await rio.authenticateWithCustomToken(customToken)

    await subscribe()
  }

  async function subscribe() {
    const todoClass = await rio.getCloudObject({
      classId: 'TodoProject',
      instanceId: '01gknxab8v630m7pn87ph8hb0j'
    })

    todoClass.state.public.subscribe(async () => {
      const response = await todoClass.call({
        method: 'get',
      })
      setTodos(response.data['todos'])
    })
  }

  async function addTodo(todo) {
    setAddModalShow(false)

    const todoClass = await rio.getCloudObject({
      classId: 'TodoProject',
      instanceId: '01gknxab8v630m7pn87ph8hb0j'
    })

    const response = await todoClass.call({
      method: 'upsert',
      body: {
        todo: todo
      }
    })
  }

  async function removeTodo(id) {
    const todoClass = await rio.getCloudObject({
      classId: 'TodoProject',
      instanceId: '01gknxab8v630m7pn87ph8hb0j'
    })

    const response = await todoClass.call({
      method: 'remove',
      body: {
        id: id
      }
    })
  }

  async function editTodo(todo, id) {
    setEditModalShow(false);

    const todoClass = await rio.getCloudObject({
      classId: 'TodoProject',
      instanceId: '01gknxab8v630m7pn87ph8hb0j'
    })

    const response = await todoClass.call({
      method: 'upsert',
      body: {
        id,
        todo
      }
    })
  }

  useEffect(() => {
    startEngine()
  }, [])

  const editInputRef = useRef()
  const [selectedId, setSelectId] = useState()
  return (
    <div className='page' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection:'column'}}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>

      <Modal show={editModalShow} onHide={() =>setEditModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Todo</Modal.Title>
        </Modal.Header>
        <Modal.Body><Form.Control ref={editInputRef}></Form.Control></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModalShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => editTodo(editInputRef.current.value, selectedId)}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={addModalShow} onHide={() =>setAddModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Todo</Modal.Title>
        </Modal.Header>
        <Modal.Body><Form.Control ref={editInputRef}></Form.Control></Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAddModalShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => addTodo(editInputRef.current.value)}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      <Table striped bordered hover variant='dark' responsive>
        <thead>
          <tr>
            <th>Id</th>
            <th>Todo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr>
              <td>{todo.id}</td>
              <td>{todo.todo}</td>
              <td>
                <div style={{ display: 'flex', justifyContent: 'center'}}>
                  <Button onClick={() => {setSelectId(todo.id); setEditModalShow(true)}} style={{ marginRight: '1em'}}><i class="fa fa-pencil"></i></Button>
                  <Button onClick={() => removeTodo(todo.id)}><i class="fa fa-remove"></i></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button onClick={() => setAddModalShow(true)}>Add Todo</Button>
    </div>
  );
}

export default App;
