<template>
  <div class="hello">
    <h1>タスク管理</h1>
    <input type="text" v-model="task.text" /> <button @click="add">追加</button>
    <ul>
      <li v-for="task in tasks" :key="task.objectId">
        {{ task.text }}
      </li>
    </ul>
  </div>
</template>

<script>
import ncmb from '@/ncmb'
import Vue from 'vue'

const Task = ncmb.DataStore('Task');

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      tasks: [],
      task: {
        text: null
      }
    }
  },
  async created() {
    if (!ncmb.User.getCurrentUser()) {
      await ncmb.User.loginAsAnonymous();
    }
    const tasks = await Task
      .equalTo('status', 'active')
      .fetchAll();
    Vue.set(this, 'tasks', tasks);
  },
  methods: {
    async add() {
      const text = this.task.text;
      const user = ncmb.User.getCurrentUser();
      const acl = new ncmb.Acl();
      acl
        .setUserReadAccess(user, true)
        .setUserWriteAccess(user, true);
      let task = new Task;
      task = await task
        .set('text', text)
        .set('status', 'active')
        .set('acl', acl)
        .save();
      this.tasks.push(task);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
