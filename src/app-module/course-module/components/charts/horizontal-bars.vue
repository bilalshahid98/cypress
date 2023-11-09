<script>
import { HorizontalBar } from "vue-chartjs";

export default {
  extends: HorizontalBar,
  props: ["labels", "data"],
  data: () => ({
    chartdata: {
      labels: [],
      datasets: [
        {
          label: "Your Average",
          backgroundColor: "#5169D5",
          data: [],
          barThickness: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            ticks: {
              min: 0,
              max: 100
            }
          }
        ]
      }
    }
  }),
  mounted() {
    this.chartdata = {
      labels: this.labels,
      datasets: this.data
    };
    this.renderChart(this.chartdata, this.options);
  },
  watch: {
    data: function(val) {
      // console.log(this.data);
      // console.log(this.labels);
      this.chartdata = {
        labels: this.labels,
        datasets: this.data
      };
      this.renderChart(this.chartdata, this.options);
    }
  }
};
</script>

<style></style>
